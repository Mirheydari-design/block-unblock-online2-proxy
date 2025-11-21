# 🚀 راهنمای کامل Deploy کردن Cloudflare Worker

## 📋 خلاصه

این Worker درخواست‌های admin.html را به API متافا forward می‌کند و مشکل CORS را حل می‌کند.

**نکته مهم:** Worker از Environment Variable استفاده می‌کند، نه hard-coded token!

---

## ✅ گام ۱: ساخت Worker در Cloudflare

1. به **Cloudflare Dashboard** برو: [dash.cloudflare.com](https://dash.cloudflare.com)

2. از منوی سمت چپ، **Workers & Pages** را انتخاب کن

3. روی **Create Application** کلیک کن

4. **Create Worker** را انتخاب کن

5. یک نام برای Worker بگذار:
   ```
   block-unblock-online22-proxy
   ```

6. روی **Deploy** کلیک کن (فعلاً کد پیش‌فرض deploy می‌شود)

---

## ✅ گام ۲: جایگزینی کد Worker

1. بعد از deploy، روی **Edit Code** یا **Quick Edit** کلیک کن

2. **تمام کد موجود** را پاک کن

3. محتوای فایل **`cloudflare-worker.js`** را کپی کن

4. در ادیتور Cloudflare، کد کپی شده را paste کن

5. **هنوز روی Save and Deploy کلیک نکن!** ابتدا باید Environment Variable را تنظیم کنی

---

## ⚙️ گام ۳: تنظیم Environment Variable (خیلی مهم!)

### روش ۱: از طریق Dashboard (توصیه می‌شود)

1. در صفحه Worker، روی تب **Settings** کلیک کن

2. به بخش **Variables** برو

3. روی **Add variable** کلیک کن

4. فیلدها را پر کن:
   ```
   Variable name: ADMIN_TOKEN
   Value: v7x4q817c8fo2e1872y8s63l5fpe9izv
   ```

5. گزینه **Encrypt** را فعال کن (برای امنیت بیشتر)

6. روی **Save** کلیک کن

### روش ۲: از طریق wrangler.toml (برای توسعه‌دهندگان)

اگر از Wrangler CLI استفاده می‌کنی، در فایل `wrangler.toml`:

```toml
[vars]
ADMIN_TOKEN = "v7x4q817c8fo2e1872y8s63l5fpe9izv"
```

⚠️ **توجه:** توکن را در فایل `wrangler.toml` نگذار! از secrets استفاده کن:

```bash
wrangler secret put ADMIN_TOKEN
# وقتی prompt شد، توکن را وارد کن: v7x4q817c8fo2e1872y8s63l5fpe9izv
```

---

## ✅ گام ۴: Deploy نهایی

1. برگرد به تب **Quick Editor**

2. مطمئن شو کد Worker به درستی paste شده

3. روی **Save and Deploy** کلیک کن

4. منتظر بمان تا deploy کامل شود (معمولاً ۵-۱۰ ثانیه)

5. آدرس Worker را یادداشت کن، مثلاً:
   ```
   https://block-unblock-online22-proxy.mehdi-2009m.workers.dev
   ```

---

## ✅ گام ۵: تست Worker

### تست ساده با curl:

```bash
curl -X POST https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/user \
  -H "Content-Type: application/json" \
  -d '{"userId":"12345","action":"block"}'
```

اگر همه چیز درست باشد، باید پاسخ از API متافا دریافت کنی.

### تست با admin.html:

1. فایل `admin.html` را در مرورگر باز کن

2. یک User ID وارد کن (مثلاً: `12345`)

3. روی **Block User** کلیک کن

4. اگر موفقیت‌آمیز بود، پیام سبز نشان داده می‌شود ✅

---

## 🔍 عیب‌یابی

### ❌ خطا: "ADMIN_TOKEN is not configured"

**علت:** Environment Variable تنظیم نشده

**راه‌حل:**
1. به **Settings** > **Variables** برو
2. مطمئن شو `ADMIN_TOKEN` اضافه شده
3. دوباره Worker را Deploy کن

---

### ❌ خطا: "CORS policy blocked"

**علت:** admin.html به جای Worker، مستقیماً به API متصل است

**راه‌حل:**
در `admin.html` بررسی کن:
```javascript
// ✅ درست
const API_BASE_URL = 'https://block-unblock-online22-proxy.mehdi-2009m.workers.dev';

// ❌ اشتباه
const API_BASE_URL = 'https://mahdaviat.metafa.ir/api/admin/block';
```

---

### ❌ خطا: "401 Unauthorized"

**علت:** توکن نادرست است یا توسط API رد شده

**راه‌حل:**
1. در Cloudflare Dashboard، **Settings** > **Variables** را چک کن
2. مطمئن شو توکن دقیقاً همین است:
   ```
   v7x4q817c8fo2e1872y8s63l5fpe9izv
   ```
3. دوباره Worker را Deploy کن

---

### ❌ خطا: "Worker threw an exception"

**علت:** مشکل در کد Worker

**راه‌حل:**
1. به **Logs** در Cloudflare Dashboard برو
2. خطای دقیق را پیدا کن
3. کد Worker را دوباره از `cloudflare-worker.js` کپی کن

---

## 📊 ساختار نهایی

```
Browser (admin.html)
    ↓
[Cloudflare Worker]
    ↓ (با ADMIN_TOKEN از env)
[Metafa API]
    ↓
✅ پاسخ (با CORS headers)
```

---

## 🔒 امنیت

✅ **توکن در Environment Variable ذخیره می‌شود** (نه در کد)
✅ **Encrypt فعال** (توکن رمزنگاری شده)
✅ **توکن در لاگ‌ها نشان داده نمی‌شود**
✅ **تنها Worker به توکن دسترسی دارد**

---

## 🎯 چک‌لیست نهایی

- [ ] Worker ساخته شد
- [ ] کد Worker از `cloudflare-worker.js` کپی شد
- [ ] Environment Variable `ADMIN_TOKEN` تنظیم شد
- [ ] Worker deploy شد
- [ ] آدرس Worker در `admin.html` صحیح است
- [ ] تست با یک User ID انجام شد
- [ ] Block/Unblock کار می‌کند ✅

---

## 💡 نکات مهم

1. **هرگز توکن را hard-code نکن** - همیشه از Environment Variables استفاده کن

2. **Worker بدون توکن کار نمی‌کند** - اگر خطای "ADMIN_TOKEN is not configured" دیدی، Environment Variable را چک کن

3. **بعد از تغییر Variable، دوباره Deploy کن** - تغییرات فوراً اعمال نمی‌شوند

4. **لاگ‌ها را چک کن** - در صورت خطا، به **Logs** در Dashboard برو

---

## 🚀 مراحل بعدی

بعد از اینکه Worker کار کرد:

1. ✅ `admin.html` را در Cloudflare Pages یا GitHub Pages Deploy کن
2. ✅ لیست بلاک شده‌ها را تست کن
3. ✅ توابع Block/Unblock را تست کن
4. ✅ از localStorage برای ذخیره لیست استفاده کن

---

**همه چیز آماده است! لذت ببر! 🎉**

