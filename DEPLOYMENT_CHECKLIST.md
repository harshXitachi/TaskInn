# Deployment Checklist for AWS Amplify

## ✅ Completed
- [x] Fixed TypeScript build error
- [x] Updated amplify.yml to install devDependencies
- [x] Improved PayPal error messages

## 🔴 Required Actions (YOU MUST DO THIS)

### 1. Add Environment Variables in AWS Amplify Console

**Critical:** Your app will NOT work without environment variables!

Go to: **AWS Amplify Console → Your App → Environment variables**

Copy ALL variables from `.env` file and add them to Amplify Console.

**Important Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE`
- All COINPAYMENTS variables
- `NEXT_PUBLIC_APP_URL` (Update with your Amplify URL after deployment)

### 2. Fix PayPal Account Restrictions

**PayPal Error: PAYEE_ACCOUNT_RESTRICTED**

This is NOT a code issue. Your PayPal account needs verification:

**Option A: Use Sandbox Mode (Testing)**
```
PAYPAL_MODE=sandbox
```
Get credentials from: https://developer.paypal.com/dashboard/

**Option B: Verify Live Account (Production)**
1. Log in to PayPal Business Account
2. Complete verification (ID, bank account, business info)
3. Remove account limitations
4. Contact PayPal support if needed: 1-888-221-1161

**Option C: Switch to Stripe**
If PayPal issues persist, consider Stripe integration

### 3. Update App URLs

After deployment, update these environment variables with your actual Amplify URL:
```
NEXT_PUBLIC_APP_URL=https://main.YOUR_APP_ID.amplifyapp.com
NEXT_PUBLIC_SITE_URL=https://main.YOUR_APP_ID.amplifyapp.com
```

## 📋 Deployment Steps

1. **Push code to GitHub** (Already done ✅)
   ```bash
   git push origin main
   ```

2. **Add environment variables in Amplify Console** ⚠️ MUST DO
   - See `AWS_AMPLIFY_SETUP.md` for detailed instructions

3. **Wait for build to complete**
   - Monitor at: AWS Amplify Console → Your App

4. **Test the application**
   - Create task (should work now)
   - PayPal deposit (will fail until account verified)
   - USDT deposit (should work)

## 🐛 Troubleshooting

### Supabase Connection Error
**Error:** `getaddrinfo ENOTFOUND db.xzlblthcjescssqepvrs.supabase.co`
**Fix:** Add environment variables in Amplify Console

### PayPal Account Restricted
**Error:** `PAYEE_ACCOUNT_RESTRICTED`
**Fix:** Verify PayPal account or use sandbox mode

### Build Fails
**Error:** TypeScript not found
**Fix:** Already fixed in code ✅

## 📚 Documentation

- Full Setup Guide: `AWS_AMPLIFY_SETUP.md`
- Environment Variables: `.env.example`

## 🚀 Quick Start

```bash
# 1. Push code (done)
git push origin main

# 2. Go to AWS Amplify Console
# 3. Add ALL environment variables
# 4. Redeploy
# 5. Update NEXT_PUBLIC_APP_URL with deployed URL
# 6. Test!
```

---

**Need Help?**
- Check `AWS_AMPLIFY_SETUP.md` for detailed instructions
- PayPal issues? Contact PayPal support
- Environment variables? Check `.env` file
