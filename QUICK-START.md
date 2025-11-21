# ⚡ راهنمای سریع - حل مشکل 401

## 🔥 مشکل:

```
admin.html → Worker → API
              ↓
       ADMIN_TOKEN = undefined
              ↓
         ❌ خطای 401
```

## ✅ راه‌حل (2 روش):

---

## 🚀 روش ۱: Deploy با Cloudflare Dashboard (آسان‌تر)

### گام ۱: کپی کردن کد Worker

کد `cloudflare-worker.js` را کپی کن.

### گام ۲: ساخت Worker

1. برو به: https://dash.cloudflare.com
2. **Workers & Pages** > **Create Application** > **Create Worker**
3. نام: `block-unblock-online22-proxy`
4. کد را paste کن
5. **هنوز Deploy نکن!**

### گام ۳: تنظیم Environment Variable

1. تب **Settings** را باز کن
2. **Variables** > **Add variable**
3. وارد کن:
   ```
   Name: ADMIN_TOKEN
   Value: v7x4q817c8fo2e1872y8s63l5fpe9izv
   ```
4. ✅ **Encrypt** را فعال کن
5. **Save** کن

### گام ۴: Deploy

1. برگرد به **Quick Edit**
2. **Save and Deploy** کن
3. ✅ تمام!

---

## 💻 روش ۲: Deploy با Wrangler CLI (حرفه‌ای‌تر)

### نصب Wrangler

```bash
npm install -g wrangler
```

### لاگین

```bash
wrangler login
```

### تنظیم Secret

```bash
wrangler secret put ADMIN_TOKEN
# وقتی prompt شد، وارد کن:
v7x4q817c8fo2e1872y8s63l5fpe9izv
```

### Deploy

```bash
wrangler deploy
```

✅ تمام!

---

## 🧪 تست Worker

### تست با curl:

```bash
curl -X POST https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/user \
  -H "Content-Type: application/json" \
  -d '{"userId":"12345","action":"block","reason":"test"}'
```

**انتظار:** پاسخ موفق از API ✅

**اگر خطا:** 
- `ADMIN_TOKEN is not configured` → Environment Variable را تنظیم کن
- `401 Unauthorized` → توکن نادرست است، دوباره چک کن

---

## 🎯 تست با admin.html

1. `admin.html` را باز کن
2. User ID وارد کن: `12345`
3. دلیل (اختیاری): `test`
4. کلیک: **Block User**
5. انتظار: ✅ پیام سبز موفقیت

---

## 🔍 چک کردن Environment Variable

### در Dashboard:

1. Workers > `block-unblock-online22-proxy`
2. **Settings** > **Variables**
3. باید ببینی:
   ```
   ADMIN_TOKEN: ••••••••••••••••• (encrypted)
   ```

### با Wrangler:

```bash
wrangler secret list
```

باید ببینی:
```
ADMIN_TOKEN
```

---

## 🐛 عیب‌یابی سریع

### ❌ "ADMIN_TOKEN is not configured"

**چک کن:**
```bash
wrangler secret list
```

**اگر خالی بود:**
```bash
wrangler secret put ADMIN_TOKEN
# وارد کن: v7x4q817c8fo2e1872y8s63l5fpe9izv
```

**دوباره Deploy:**
```bash
wrangler deploy
```

---

### ❌ "401 Unauthorized"

**علت:** توکن نادرست یا ارسال نشده

**راه‌حل:**
1. چک کن توکن دقیقاً همین باشد:
   ```
   v7x4q817c8fo2e1872y8s63l5fpe9izv
   ```
2. دوباره secret را set کن:
   ```bash
   wrangler secret put ADMIN_TOKEN
   ```

---

### ❌ "CORS policy blocked"

**علت:** admin.html مستقیم به API متصل است

**راه‌حل:**

در `admin.html` چک کن:

```javascript
// ✅ درست
const API_BASE_URL = 'https://block-unblock-online22-proxy.mehdi-2009m.workers.dev';

// ❌ اشتباه
const API_BASE_URL = 'https://mahdaviat.metafa.ir/api/admin/block';
```

---

## 📊 ساختار درست:

```
┌─────────────┐
│   Browser   │
│ (admin.html)│
└──────┬──────┘
       │ POST /user
       │ {"userId":"12345","action":"block"}
       ↓
┌─────────────────────┐
│  Cloudflare Worker  │
│                     │
│ env.ADMIN_TOKEN ✅  │
└──────┬──────────────┘
       │ POST /user
       │ Header: X-Admin-Token: v7x4q...
       ↓
┌─────────────┐
│  Metafa API │
│             │
│ ✅ توکن OK │
└──────┬──────┘
       │ 200 OK
       ↓
    Browser
```

---

## ✅ چک‌لیست نهایی

- [ ] Worker ساخته شد
- [ ] کد `cloudflare-worker.js` paste شد
- [ ] **ADMIN_TOKEN در Variables تنظیم شد** ⭐
- [ ] Encrypt فعال شد
- [ ] Worker deploy شد
- [ ] `admin.html` به Worker متصل است
- [ ] تست با curl موفق بود
- [ ] تست با admin.html موفق بود

---

## 🎉 اگر همه این‌ها OK بود:

**تبریک! همه چیز کار می‌کند! 🚀**

حالا می‌تونی:
- ✅ کاربران را Block/Unblock کنی
- ✅ پست‌ها را Block/Unblock کنی
- ✅ لیست بلاک شده‌ها را ببینی
- ✅ از localStorage استفاده کنی

---

**نکته طلایی:** همیشه ADMIN_TOKEN را در Environment Variable نگه دار، هرگز در کد نگذار!

