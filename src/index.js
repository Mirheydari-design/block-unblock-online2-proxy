/**
 * 🔥 Cloudflare Worker Proxy - نسخه حرفه‌ای
 * 
 * ویژگی‌ها:
 * ✅ امنیت بالا با env.ADMIN_TOKEN
 * ✅ پشتیبانی از /post و /user
 * ✅ مدیریت کامل خطاها
 * ✅ CORS headers
 * ✅ Production-ready
 * ✅ Link Preview (/preview)
 */

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      // اجازه GET برای /preview بدون نیاز به توکن
      if (request.method === "GET" && pathname.startsWith("/preview")) {
        return await fetchLinkPreview(request);
      }

      // --- مسیردهی ---
      // پشتیبانی از /post و /post/ و /user و /user/
      const normalizedPath = pathname.replace(/\/$/, "");

      // --- امنیت: بررسی توکن از کلاینت برای عملیات حساس ---
      const clientToken = request.headers.get("X-Admin-Token");
      if (!clientToken) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Missing admin token",
            message: "لطفاً X-Admin-Token را در هدر ارسال کنید"
          }), 
          { 
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            }
          }
        );
      }

      // بررسی توکن با Environment Variable
      if (!env.ADMIN_TOKEN) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "ADMIN_TOKEN not configured",
            message: "توکن ادمین در Worker تنظیم نشده است"
          }), 
          { 
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            }
          }
        );
      }

      if (clientToken !== env.ADMIN_TOKEN) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Invalid admin token",
            message: "توکن ادمین نامعتبر است"
          }), 
          { 
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            }
          }
        );
      }
      
      if (normalizedPath === "/post") {
        return await proxyToBackend("/api/admin/block/post", request, env);
      }

      if (normalizedPath === "/user") {
        return await proxyToBackend("/api/admin/block/user", request, env);
      }

      // مسیر پیدا نشد
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Not found",
          message: `مسیر ${pathname} یافت نشد. مسیرهای معتبر: /post, /user, /preview`
        }), 
        { 
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal worker error",
          message: "خطای داخلی Worker",
          details: err.message
        }), 
        { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }
  },
};

/**
 * تابع پراکسی حرفه‌ای برای ارسال درخواست به Backend
 */
async function proxyToBackend(endpoint, request, env) {
  const backendUrl = "https://mahdaviat.metafa.ir" + endpoint;
  
  let body;
  try {
    body = await request.text();
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Request body error",
        message: "خطا در خواندن body درخواست",
        details: error.message
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
  }

  console.log(`[Worker] Forwarding ${request.method} ${endpoint}`);

  try {
    // Timeout: 30 ثانیه
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": env.ADMIN_TOKEN,
      },
      body: body || undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let result;
    try {
      result = await res.text();
    } catch (error) {
      result = JSON.stringify({
        success: false,
        error: "Response parsing error",
        message: "خطا در خواندن پاسخ از سرور",
        status: res.status
      });
    }

    return new Response(result, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
      }
    });
  } catch (error) {
    console.error(`[Worker] Error forwarding to backend:`, error);
    
    // بررسی نوع خطا
    let errorMessage = "خطا در ارتباط با سرور متافا";
    let statusCode = 500;
    
    if (error.name === "AbortError") {
      errorMessage = "Timeout: سرور متافا پاسخ نداد (بیش از 30 ثانیه)";
      statusCode = 504;
    } else if (error.message.includes("fetch")) {
      errorMessage = "خطا در اتصال به سرور متافا";
      statusCode = 502;
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Backend communication error",
        message: errorMessage,
        details: error.message,
        endpoint: endpoint
      }),
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
        }
      }
    );
  }
}

/**
 * دریافت اطلاعات متای لینک (OG Tags) برای پیش‌نمایش
 */
async function fetchLinkPreview(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "URL parameter is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BlockUnblockBot/1.0)",
      },
    });

    const html = await response.text();

    // استخراج اطلاعات ساده با Regex
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/i) || html.match(/<title>([^<]*)<\/title>/i);
    const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/i) || html.match(/<meta name="description" content="([^"]*)"/i);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/i);

    const preview = {
      title: titleMatch ? titleMatch[1] : "",
      description: descriptionMatch ? descriptionMatch[1] : "",
      image: imageMatch ? imageMatch[1] : "",
      url: targetUrl
    };

    return new Response(JSON.stringify(preview), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch URL", details: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
