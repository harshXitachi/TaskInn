# AWS Amplify Deployment Setup Guide

## Issues Fixed

### 1. TypeScript Build Error ✅
- Moved TypeScript to `devDependencies`
- Updated `amplify.yml` to include dev dependencies

### 2. Environment Variables Issues ❌ (Action Required)

## Critical: Environment Variables Setup

Your application requires environment variables to be set in AWS Amplify Console. The errors you're seeing are because these variables are missing.

### Steps to Add Environment Variables in AWS Amplify:

1. **Go to AWS Amplify Console**
   - Navigate to your app: https://console.aws.amazon.com/amplify/
   - Select your TaskInn app

2. **Open Environment Variables Settings**
   - Click on "Environment variables" in the left sidebar
   - Or go to: App settings > Environment variables

3. **Add ALL the following environment variables:**

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xzlblthcjescssqepvrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6bGJsdGhjamVzY3NzcWVwdnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjA0OTQsImV4cCI6MjA3NDg5NjQ5NH0.4IN-3fKkROEhnYpoYrUBWTYtnJQVSHzx-Yq_c0XIz_c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6bGJsdGhjamVzY3NzcWVwdnJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMyMDQ5NCwiZXhwIjoyMDc0ODk2NDk0fQ.y_sT_q8Z7iRgEgV5fNC3vs4hgrgFpsEjFcZ-QA-dSpo

# Database URL
DATABASE_URL=postgresql://postgres:Taskinn%211911%21@db.xzlblthcjescssqepvrs.supabase.co:5432/postgres

# PayPal Configuration
PAYPAL_CLIENT_ID=AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE
PAYPAL_CLIENT_SECRET=EElmez_2nNLl8SohHumQZsTTIv3_Lk3OwVagVvjesSYVsqr_2uGebrPB5WeTbWD-Kf9cWR7FsFUdn-sm
PAYPAL_MODE=live

# CoinPayments Configuration
COINPAYMENTS_PUBLIC_KEY=1907f64adb789107b37eca250f676527309883ac449f49a14313f734f862bb6b
COINPAYMENTS_PRIVATE_KEY=B1cF1B893526137034e9988971ad57C98431266061B71D110f26B82a2A73F3b8
COINPAYMENTS_API_KEY=1907f64adb789107b37eca250f676527309883ac449f49a14313f734f862bb6b
COINPAYMENTS_API_SECRET=B1cF1B893526137034e9988971ad57C98431266061B71D110f26B82a2A73F3b8
COINPAYMENTS_IPN_SECRET=B1cF1B893526137034e9988971ad57C98431266061B71D110f26B82a2A73F3b8

# App Configuration (IMPORTANT: Update this with your actual Amplify URL)
NEXT_PUBLIC_APP_URL=https://main.YOUR_AMPLIFY_APP_ID.amplifyapp.com
NEXT_PUBLIC_SITE_URL=https://main.YOUR_AMPLIFY_APP_ID.amplifyapp.com
```

4. **Update NEXT_PUBLIC_APP_URL**
   - After deployment, get your actual Amplify URL (e.g., `https://main.d1rz8nvlrffpam.amplifyapp.com`)
   - Update the `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` variables with this URL

5. **Save and Redeploy**
   - Click "Save"
   - Trigger a new deployment (or it will auto-deploy)

## PayPal Account Issues

### Error: PAYEE_ACCOUNT_RESTRICTED

This error indicates your PayPal account has restrictions. This is NOT a code issue.

#### Solutions:

1. **Sandbox Mode (for testing):**
   - Change `PAYPAL_MODE` from `live` to `sandbox` in environment variables
   - Use PayPal Sandbox credentials instead
   - Create sandbox account at: https://developer.paypal.com/dashboard/accounts

2. **Live Mode (for production):**
   - **Verify your PayPal Business Account:**
     - Log in to https://www.paypal.com
     - Complete business verification
     - Add bank account
     - Remove any account limitations
   
   - **Contact PayPal Support:**
     - If account is restricted, only PayPal can remove restrictions
     - Call: 1-888-221-1161 (US) or your local PayPal support
     - Explain you need to accept payments for your business

   - **Check Account Status:**
     - Go to PayPal Dashboard > Settings
     - Look for any notifications or limitations
     - Complete any required actions

3. **Alternative: Use Stripe Instead**
   - If PayPal issues persist, consider integrating Stripe
   - Stripe has faster approval and fewer restrictions

## Verification Steps

After setting environment variables:

1. ✅ Build should complete successfully
2. ✅ Supabase connection should work (no ENOTFOUND errors)
3. ❌ PayPal will still fail until account restrictions are resolved

## Important Notes

- **NEVER commit `.env` file to GitHub** (it's already in .gitignore)
- Environment variables in AWS Amplify are separate from your local `.env`
- Each time you update variables in Amplify, redeploy the app
- Test thoroughly in sandbox mode before going live

## Quick Test

After adding environment variables:
1. Deploy the app
2. Try creating a task (should work now)
3. PayPal will still show error until PayPal account is unrestricted
