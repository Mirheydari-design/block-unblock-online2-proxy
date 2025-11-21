/**
 * 🔥 Cloudflare Worker Proxy for Block/Unblock Admin Panel
 * 
 * این Worker درخواست‌های admin.html را به API متافا forward می‌کند
 * و مشکل CORS را حل می‌کند.
 * 
 * ⚠️ مهم: ADMIN_TOKEN باید در Environment Variables تنظیم شود
 */

export default {
  async fetch(request, env) {
    // دریافت ADMIN_TOKEN از Environment Variables
    const ADMIN_TOKEN = env.ADMIN_TOKEN;

    // بررسی اینکه توکن تنظیم شده باشد
    if (!ADMIN_TOKEN) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ADMIN_TOKEN is not configured",
          message: "لطفاً ADMIN_TOKEN را در Environment Variables تنظیم کنید"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // URL اصلی API متافا
    const backendUrl = "https://mahdaviat.metafa.ir/api/admin/block";

    // مسیر را به همون ساختار /user یا /post پاس بده
    const path = url.pathname.replace(/\/$/, "");

    try {
      // دریافت body از request
      const body = await request.text();

      // ارسال درخواست به API متافا با ADMIN_TOKEN
      const res = await fetch(backendUrl + path, {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": ADMIN_TOKEN,
        },
        body: body || undefined,
      });

      // دریافت پاسخ از API
      const responseBody = await res.text();

      // برگرداندن پاسخ با CORS headers
      return new Response(responseBody, {
        status: res.status,
        statusText: res.statusText,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token, Authorization",
          "Content-Type": res.headers.get("Content-Type") || "application/json",
        },
      });
    } catch (error) {
      // مدیریت خطاها
      console.error("[Worker] Error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Worker Proxy Error",
          message: error.message,
          details: "خطا در ارتباط با سرور متافا",
        }),
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};

