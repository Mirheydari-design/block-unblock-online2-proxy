# 🛡️ Block/Unblock Admin Panel - Cloudflare Worker Proxy

پنل مدیریت قدرتمند برای Block/Unblock کاربران و پست‌ها با استفاده از Cloudflare Worker Proxy.

## 🌟 ویژگی‌ها

✅ **Block/Unblock کاربران** - مدیریت کاربران با User ID  
✅ **Block/Unblock پست‌ها** - مدیریت پست‌ها با Post ID  
✅ **لیست بلاک شده‌ها** - مشاهده و مدیریت تمام موارد بلاک شده  
✅ **جستجو و فیلتر** - جستجوی سریع در لیست‌ها  
✅ **لاگ‌گیری کامل** - ثبت تمام اقدامات با جزئیات  
✅ **ذخیره محلی** - لیست‌ها در localStorage ذخیره می‌شوند  
✅ **حل مشکل CORS** - با استفاده از Cloudflare Worker Proxy  
✅ **امنیت بالا** - استفاده از Environment Variables  

---

## 📁 ساختار پروژه

```
block-unblock-online2-proxy/
├── admin.html                      # پنل ادمین (UI)
├── cloudflare-worker.js            # کد Cloudflare Worker
├── index.html                      # صفحه اصلی
├── WORKER-DEPLOYMENT-GUIDE.md      # راهنمای کامل Deploy
├── API-CHANGES.md                  # تغییرات API
├── BLOCKED-LIST-FEATURE.md         # راهنمای قابلیت لیست بلاک
└── README.md                       # این فایل
```

---

## 🚀 راه‌اندازی سریع

### گام ۱: Deploy کردن Worker

1. به [Cloudflare Dashboard](https://dash.cloudflare.com) برو
2. **Workers & Pages** > **Create Application** > **Create Worker**
3. کد `cloudflare-worker.js` را کپی کن و جایگزین کن
4. **Settings** > **Variables** > اضافه کردن:
   ```
   ADMIN_TOKEN = v7x4q817c8fo2e1872y8s63l5fpe9izv
   ```
5. **Save and Deploy** کن

### گام ۲: استفاده از Admin Panel

1. فایل `admin.html` را باز کن
2. User ID یا Post ID را وارد کن
3. روی **Block** یا **Unblock** کلیک کن
4. لیست بلاک شده‌ها را در بخش مربوطه مشاهده کن

---

## 📖 مستندات کامل

### راهنماها:

- 📘 **[WORKER-DEPLOYMENT-GUIDE.md](WORKER-DEPLOYMENT-GUIDE.md)** - راهنمای کامل Deploy
- 📗 **[BLOCKED-LIST-FEATURE.md](BLOCKED-LIST-FEATURE.md)** - راهنمای قابلیت لیست بلاک
- 📙 **[API-CHANGES.md](API-CHANGES.md)** - تغییرات و بهبودهای API

---

## 🎨 نمای کلی

### پنل ادمین:
- 👤 **مدیریت کاربران** - Block/Unblock با User ID
- 📝 **مدیریت پست‌ها** - Block/Unblock با Post ID
- 🚫 **لیست بلاک شده‌ها** - مشاهده همه موارد بلاک شده
- 📋 **تاریخچه لاگ‌ها** - لاگ کامل تمام اقدامات

### Worker Proxy:
```
[Browser] → [Cloudflare Worker] → [Metafa API]
              ↓ (با ADMIN_TOKEN)
           ✅ حل مشکل CORS
```

---

## ⚙️ تنظیمات

### Environment Variables

در Cloudflare Worker:

```
ADMIN_TOKEN = v7x4q817c8fo2e1872y8s63l5fpe9izv
```

### API URL در admin.html

```javascript
const API_BASE_URL = 'https://block-unblock-online2-proxy.mehdi-2009m.workers.dev';
```

---

## 🔧 API Endpoints

### Block/Unblock کاربر

```bash
POST /user
Content-Type: application/json

{
  "userId": "12345",
  "action": "block",
  "reason": "محتوای نامناسب"
}
```

### Block/Unblock پست

```bash
POST /post
Content-Type: application/json

{
  "postId": "d58d983a-cd29-419b-8329-7f60e9e78c6e",
  "action": "unblock",
  "reason": "بررسی مجدد"
}
```

---

## 🔒 امنیت

✅ **Environment Variables** - توکن در متغیرهای محیطی ذخیره می‌شود  
✅ **Encryption** - توکن رمزنگاری شده در Cloudflare  
✅ **CORS Headers** - دسترسی محدود و کنترل شده  
✅ **Validation** - بررسی و اعتبارسنجی تمام ورودی‌ها  

---

## 🐛 عیب‌یابی

### خطا: "ADMIN_TOKEN is not configured"

**راه‌حل:** 
- به **Settings** > **Variables** در Cloudflare برو
- مطمئن شو `ADMIN_TOKEN` تنظیم شده
- دوباره Worker را Deploy کن

### خطا: "CORS policy blocked"

**راه‌حل:**
- مطمئن شو `admin.html` به Worker متصل است، نه مستقیم به API
- بررسی کن `API_BASE_URL` آدرس Worker را دارد

### خطا: "401 Unauthorized"

**راه‌حل:**
- توکن را در Environment Variables چک کن
- مطمئن شو توکن دقیقاً صحیح است

برای راهنمای کامل عیب‌یابی، [WORKER-DEPLOYMENT-GUIDE.md](WORKER-DEPLOYMENT-GUIDE.md) را ببین.

---

## 📊 ویژگی‌های پیشرفته

### localStorage Persistence

لیست بلاک شده‌ها در localStorage ذخیره می‌شوند:
- `admin_blocked_users` - لیست کاربران بلاک شده
- `admin_blocked_posts` - لیست پست‌های بلاک شده
- `admin_panel_logs` - تاریخچه لاگ‌ها

### Real-time Search

جستجوی فوری در لیست‌ها بدون نیاز به API.

### Responsive Design

کاملاً responsive و سازگار با موبایل، تبلت و دسکتاپ.

---

## 🎯 به‌روزرسانی‌های اخیر

- ✅ استفاده از Environment Variables به جای hard-coded token
- ✅ بهبود error handling
- ✅ اضافه شدن قابلیت لیست بلاک شده‌ها
- ✅ جستجو و فیلتر در لیست‌ها
- ✅ لاگ‌گیری کامل با جزئیات
- ✅ UI/UX بهبود یافته

---

## 🤝 مشارکت

این پروژه برای **Platform Mahdavi** توسعه یافته است.

---

## 📝 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

---

## 🙏 تشکر

- **Cloudflare Workers** - برای ارائه platform قدرتمند
- **Metafa API** - برای ارائه backend API
- **Platform Mahdavi** - برای حمایت از پروژه

---

**ساخته شده با ❤️ برای Platform Mahdavi**

