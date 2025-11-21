# 🔧 راهنمای عیب‌یابی - خطای "Failed to fetch"

## ❌ مشکل: "Failed to fetch"

این خطا معمولاً به این دلایل است:

---

## 🔍 بررسی گام به گام

### 1️⃣ بررسی Deploy شدن Worker

#### در Cloudflare Dashboard:

1. برو به: https://dash.cloudflare.com
2. **Workers & Pages** > **block-unblock-online22-proxy**
3. تب **Overview** را باز کن
4. باید ببینی:
   - ✅ Status: Active
   - ✅ Last Deployed: تاریخ اخیر

**اگر Worker deploy نشده:**
```bash
# با Wrangler
wrangler deploy

# یا در Dashboard
Quick Edit > Save and Deploy
```

---

### 2️⃣ بررسی Environment Variable

#### در Cloudflare Dashboard:

1. Workers > `block-unblock-online22-proxy`
2. **Settings** > **Variables**
3. باید ببینی:
   ```
   ADMIN_TOKEN: ••••••••••••••••• (encrypted)
   ```

**اگر تنظیم نشده:**

```bash
# با Wrangler
wrangler secret put ADMIN_TOKEN
# وارد کن: v7x4q817c8fo2e1872y8s63l5fpe9izv

# یا در Dashboard
Settings > Variables > Add variable
Name: ADMIN_TOKEN
Value: v7x4q817c8fo2e1872y8s63l5fpe9izv
✅ Encrypt
Save
```

**بعد از تنظیم، دوباره Deploy کن!**

---

### 3️⃣ تست مستقیم Worker

#### با curl:

```bash
curl -X POST \
  https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: v7x4q817c8fo2e1872y8s63l5fpe9izv" \
  -d '{"postId":"test-123","action":"block"}' \
  -v
```

**پاسخ‌های احتمالی:**

#### ✅ موفق (200):
```json
{
  "success": true,
  "message": "..."
}
```

#### ❌ 401 - Missing token:
```json
{
  "error": "Missing admin token"
}
```
→ توکن در header ارسال نشده

#### ❌ 403 - Invalid token:
```json
{
  "error": "Invalid admin token"
}
```
→ توکن نادرست است یا `env.ADMIN_TOKEN` تنظیم نشده

#### ❌ 500 - Token not configured:
```json
{
  "error": "ADMIN_TOKEN not configured"
}
```
→ Environment Variable تنظیم نشده

---

### 4️⃣ بررسی Logs در Cloudflare

1. Workers > `block-unblock-online22-proxy`
2. تب **Logs** را باز کن
3. یک درخواست بفرست
4. لاگ‌ها را ببین

**لاگ‌های مفید:**
```
[Worker] Forwarding POST /api/admin/block/post
```

**اگر خطا دیدی:**
```
[Worker] Error forwarding to backend: ...
```

---

### 5️⃣ بررسی Network در Browser

1. `admin.html` را باز کن
2. **F12** > **Network** tab
3. یک درخواست بفرست
4. روی درخواست کلیک کن

**بررسی کن:**

#### Request Headers:
```
Content-Type: application/json
X-Admin-Token: v7x4q817c8fo2e1872y8s63l5fpe9izv
```

#### Response:
- **Status:** باید 200, 401, 403, 404, 500 باشد (نه "Failed")
- **Headers:** باید `Access-Control-Allow-Origin: *` داشته باشد

#### اگر "Failed to fetch" دیدی:
- **CORS Error:** Worker CORS headers برنمی‌گرداند
- **Network Error:** Worker در دسترس نیست
- **Timeout:** Worker بیش از 30 ثانیه طول کشیده

---

## 🛠️ راه‌حل‌های سریع

### راه‌حل 1: Re-deploy Worker

```bash
# با Wrangler
wrangler deploy --force

# یا در Dashboard
Quick Edit > Save and Deploy
```

---

### راه‌حل 2: بررسی URL در admin.html

در `admin.html` چک کن:

```javascript
// ✅ درست
const API_BASE_URL = 'https://block-unblock-online22-proxy.mehdi-2009m.workers.dev';

// ❌ اشتباه
const API_BASE_URL = 'https://mahdaviat.metafa.ir/api/admin/block';
```

---

### راه‌حل 3: بررسی توکن در admin.html

```javascript
// ✅ درست
const ADMIN_TOKEN = 'v7x4q817c8fo2e1872y8s63l5fpe9izv';

// در fetch
headers: {
  'X-Admin-Token': ADMIN_TOKEN
}
```

---

### راه‌حل 4: تست با Postman

1. Postman را باز کن
2. **POST** `https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post`
3. Headers:
   ```
   Content-Type: application/json
   X-Admin-Token: v7x4q817c8fo2e1872y8s63l5fpe9izv
   ```
4. Body (raw JSON):
   ```json
   {
     "postId": "test-123",
     "action": "block"
   }
   ```
5. **Send**

**اگر کار کرد:** مشکل از `admin.html` است  
**اگر کار نکرد:** مشکل از Worker است

---

## 🧪 تست کامل Worker

### تست 1: Health Check

```bash
curl https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: v7x4q817c8fo2e1872y8s63l5fpe9izv" \
  -d '{"postId":"test","action":"block"}'
```

### تست 2: بدون توکن (باید 401 بدهد)

```bash
curl https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"postId":"test","action":"block"}'
```

**انتظار:** `{"error":"Missing admin token"}`

### تست 3: توکن نادرست (باید 403 بدهد)

```bash
curl https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: wrong-token" \
  -d '{"postId":"test","action":"block"}'
```

**انتظار:** `{"error":"Invalid admin token"}`

---

## 📊 جدول خطاها

| خطا | علت | راه‌حل |
|-----|-----|--------|
| Failed to fetch | Worker deploy نشده | Deploy کن |
| Failed to fetch | CORS مشکل دارد | Worker را چک کن |
| 401 Missing token | توکن ارسال نشده | Header را چک کن |
| 403 Invalid token | توکن نادرست | توکن را بررسی کن |
| 500 Token not configured | env.ADMIN_TOKEN تنظیم نشده | Variable را تنظیم کن |
| 404 Not found | مسیر نادرست | از `/post` یا `/user` استفاده کن |
| 502/504 Backend error | مشکل در API متافا | API را چک کن |

---

## ✅ چک‌لیست نهایی

- [ ] Worker deploy شده است
- [ ] `ADMIN_TOKEN` در Variables تنظیم شده
- [ ] Worker در Dashboard Active است
- [ ] تست با curl موفق است
- [ ] `admin.html` به Worker متصل است (نه مستقیم به API)
- [ ] توکن در `admin.html` صحیح است
- [ ] Network tab در Browser خطا نشان نمی‌دهد
- [ ] Logs در Cloudflare خطا نشان نمی‌دهند

---

## 🆘 اگر هنوز کار نمی‌کند

1. **Worker را کاملاً حذف و دوباره بساز**
2. **Environment Variable را دوباره تنظیم کن**
3. **کد Worker را از `src/index.js` دوباره کپی کن**
4. **Deploy کن و تست کن**

---

## 📞 پشتیبانی

اگر مشکل حل نشد:
1. لاگ‌های Cloudflare را ببین
2. Network tab در Browser را بررسی کن
3. تست با curl را انجام بده
4. نتایج را با تیم توسعه به اشتراک بگذار

---

**آخرین به‌روزرسانی:** نوامبر 2024

