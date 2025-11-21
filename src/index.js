/**
 * 🔥 Cloudflare Worker Proxy - نسخه حرفه‌ای
 * 
 * ویژگی‌ها:
 * ✅ امنیت بالا با env.ADMIN_TOKEN
 * ✅ پشتیبانی از /post و /user
 * ✅ مدیریت کامل خطاها
 * ✅ CORS headers
 * ✅ Production-ready
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
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      // --- امنیت: بررسی توکن از کلاینت ---
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

      // --- مسیردهی ---
      if (pathname === "/post") {
        return await proxyToBackend("/api/admin/block/post", request, env);
      }

      if (pathname === "/user") {
        return await proxyToBackend("/api/admin/block/user", request, env);
      }

      // مسیر پیدا نشد
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Not found",
          message: `مسیر ${pathname} یافت نشد. مسیرهای معتبر: /post, /user`
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
 * 
 * @param {string} endpoint - مسیر API (مثلاً /api/admin/block/post)
 * @param {Request} request - درخواست اصلی
 * @param {Object} env - Environment Variables
 * @returns {Response} پاسخ از Backend با CORS headers
 */
async function proxyToBackend(endpoint, request, env) {
  const backendUrl = "https://mahdaviat.metafa.ir" + endpoint;
  const body = await request.text();

  console.log(`[Worker] Forwarding ${request.method} ${endpoint}`);

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": env.ADMIN_TOKEN,
      },
      body,
    });

    const result = await res.text();

    return new Response(result, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
      }
    });
  } catch (error) {
    console.error(`[Worker] Error forwarding to backend:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Backend communication error",
        message: "خطا در ارتباط با سرور متافا",
        details: error.message
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
}
