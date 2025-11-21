# 🔥 راهنمای تنظیم Route در Cloudflare Worker

## ❌ مشکل: "Failed to fetch" به دلیل Route اشتباه

### مشکل اصلی:

درخواست‌ها به این آدرس می‌روند:
```
https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post
```

ولی Worker Route ندارد یا Route اشتباه است!

---

## ✅ راه‌حل: تنظیم Route درست

### گام ۱: ورود به Cloudflare Dashboard

1. برو به: https://dash.cloudflare.com
2. **Workers & Pages** را انتخاب کن
3. Worker **`block-unblock-online22-proxy`** را پیدا کن و کلیک کن

---

### گام ۲: تنظیم Route

1. در صفحه Worker، تب **Settings** را باز کن
2. به بخش **Domains & Routes** برو
3. بررسی کن که آیا Route زیر وجود دارد:

```
Route: block-unblock-online22-proxy.mehdi-2009m.workers.dev/*
Worker: block-unblock-online22-proxy
```

---

### گام ۳: اضافه کردن Route (اگر وجود ندارد)

1. روی دکمه **Add Route** کلیک کن
2. در فیلد **Route** وارد کن:
   ```
   block-unblock-online22-proxy.mehdi-2009m.workers.dev/*
   ```
   ⚠️ **مهم:** حتماً `/*` در انتها باشد (wildcard)

3. در فیلد **Worker** انتخاب کن:
   ```
   block-unblock-online22-proxy
   ```

4. روی **Save** کلیک کن

---

## 🎯 چرا `/*` لازم است؟

### بدون wildcard (`/*`):
```
Route: block-unblock-online22-proxy.mehdi-2009m.workers.dev
```

**مشکل:**
- ✅ فقط `/` کار می‌کند
- ❌ `/post` → 404
- ❌ `/user` → 404

### با wildcard (`/*`):
```
Route: block-unblock-online22-proxy.mehdi-2009m.workers.dev/*
```

**نتیجه:**
- ✅ `/` کار می‌کند
- ✅ `/post` کار می‌کند
- ✅ `/user` کار می‌کند
- ✅ هر مسیری کار می‌کند

---

## 🧪 تست Route

### تست ۱: بدون توکن (باید 401 بدهد)

```bash
curl https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"postId":"test","action":"block"}'
```

**انتظار:**
```json
{
  "error": "Missing admin token",
  "message": "لطفاً X-Admin-Token را در هدر ارسال کنید"
}
```

**اگر "Failed to fetch" یا 404 دیدی:**
→ Route تنظیم نشده یا اشتباه است

---

### تست ۲: با توکن (باید به Backend برود)

```bash
curl https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: v7x4q817c8fo2e1872y8s63l5fpe9izv" \
  -d '{"postId":"test-123","action":"block"}'
```

**انتظار:**
- پاسخ از Backend (موفق یا خطا از API)
- **نه** "Failed to fetch"

---

## 🔍 بررسی Route در Dashboard

### روش ۱: از طریق Settings

1. Workers > `block-unblock-online22-proxy`
2. **Settings** > **Domains & Routes**
3. باید ببینی:

```
┌─────────────────────────────────────────────────────┐
│ Route                                               │
│ block-unblock-online22-proxy.mehdi-2009m.workers.dev/* │
│                                                     │
│ Worker                                              │
│ block-unblock-online22-proxy                        │
└─────────────────────────────────────────────────────┘
```

---

### روش ۲: از طریق wrangler.toml

اگر از Wrangler CLI استفاده می‌کنی:

```toml
name = "block-unblock-online22-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"

# Routes (اختیاری - معمولاً از Dashboard تنظیم می‌شود)
# routes = [
#   { pattern = "block-unblock-online22-proxy.mehdi-2009m.workers.dev/*", zone_name = "mehdi-2009m.workers.dev" }
# ]
```

---

## ⚠️ مشکلات رایج

### مشکل ۱: Route به Worker دیگر متصل است

**علت:** Worker `block-unblock-online22-proxy` (با 22) Route دارد

**راه‌حل:**
1. Worker `block-unblock-online22-proxy` را پیدا کن
2. Route آن را حذف کن یا تغییر بده
3. Route را به `block-unblock-online22-proxy` اضافه کن

---

### مشکل ۲: Route بدون wildcard

**علت:**
```
Route: block-unblock-online22-proxy.mehdi-2009m.workers.dev
```

**راه‌حل:**
Route را تغییر بده به:
```
block-unblock-online22-proxy.mehdi-2009m.workers.dev/*
```

---

### مشکل ۳: Route به Worker اشتباه متصل است

**علت:** Route به Worker دیگری متصل است

**راه‌حل:**
1. Route را Edit کن
2. Worker را به `block-unblock-online22-proxy` تغییر بده
3. Save کن

---

## 📊 ساختار Route درست

```
┌─────────────────────────────────────────────┐
│ Cloudflare Worker                           │
│                                             │
│ Name: block-unblock-online22-proxy          │
│                                             │
│ Routes:                                     │
│ ┌───────────────────────────────────────┐ │
│ │ block-unblock-online22-proxy.          │ │
│ │   mehdi-2009m.workers.dev/*            │ │
│ └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
              ↓
    درخواست‌ها:
    ✅ /post
    ✅ /user
    ✅ / (root)
```

---

## ✅ چک‌لیست نهایی

- [ ] Worker `block-unblock-online22-proxy` وجود دارد
- [ ] Route اضافه شده: `block-unblock-online22-proxy.mehdi-2009m.workers.dev/*`
- [ ] Route به Worker درست متصل است
- [ ] Wildcard `/*` در Route وجود دارد
- [ ] تست بدون توکن → 401 می‌دهد (نه Failed to fetch)
- [ ] تست با توکن → پاسخ از Backend می‌آید

---

## 🎯 بعد از تنظیم Route

1. **صبر کن 1-2 دقیقه** (Route ممکن است کمی طول بکشد تا فعال شود)

2. **تست کن:**
   ```bash
   curl https://block-unblock-online22-proxy.mehdi-2009m.workers.dev/post \
     -X POST \
     -H "Content-Type: application/json" \
     -H "X-Admin-Token: v7x4q817c8fo2e1872y8s63l5fpe9izv" \
     -d '{"postId":"test","action":"block"}'
   ```

3. **در admin.html تست کن:**
   - یک Post ID وارد کن
   - روی Block کلیک کن
   - باید پیام موفقیت ببینی ✅

---

## 🆘 اگر هنوز کار نمی‌کند

1. **Route را حذف و دوباره اضافه کن**
2. **Worker را دوباره Deploy کن**
3. **صبر کن 2-3 دقیقه**
4. **تست کن**

---

**نکته طلایی:** همیشه Route باید wildcard (`/*`) داشته باشد تا مسیرهای `/post` و `/user` کار کنند!

---

**آخرین به‌روزرسانی:** نوامبر 2024

