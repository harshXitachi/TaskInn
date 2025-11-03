# Supabase Auth Quick Reference Guide

## 📖 Table of Contents
1. [Client-Side Auth](#client-side-auth)
2. [Server-Side Auth](#server-side-auth)
3. [Middleware](#middleware)
4. [Common Patterns](#common-patterns)

---

## Client-Side Auth

### Using the Custom Hook
```typescript
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

function MyComponent() {
  const { user, loading } = useSupabaseUser();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Hello, {user.email}!</div>;
}
```

### Direct Client Usage
```typescript
import { createClient } from "@/lib/supabase/client";

async function handleAction() {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get session (includes access token)
  const { data: { session } } = await supabase.auth.getSession();
}
```

### Sign Up
```typescript
const supabase = createClient();
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
  options: {
    data: {
      name: "John Doe",
      role: "worker",
    },
  },
});
```

### Sign In
```typescript
const supabase = createClient();
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});
```

### Sign Out
```typescript
const supabase = createClient();
const { error } = await supabase.auth.signOut();
```

### OAuth (Google, etc.)
```typescript
const supabase = createClient();
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

---

## Server-Side Auth

### Server Components
```typescript
import { createClient } from "@/lib/supabase/server";

export default async function ServerComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <div>Hello, {user.email}!</div>;
}
```

### API Routes
```typescript
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Your protected logic here
  return Response.json({ data: "Success" });
}
```

### Getting Access Token for External APIs
```typescript
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();

// Use session.access_token for Bearer authentication
const response = await fetch("/api/external", {
  headers: {
    Authorization: `Bearer ${session?.access_token}`,
  },
});
```

---

## Middleware

The middleware automatically:
- Refreshes expired sessions
- Protects routes from unauthenticated users
- Redirects to login when needed

### Current Protected Routes:
- `/dashboard`
- `/worker`
- `/employer`
- `/admin`
- `/profile`
- `/tasks/create`
- `/tasks/manage`
- `/earnings`
- `/withdrawals`

### Public Routes:
- `/`
- `/login`
- `/signup`
- `/auth/*`

### Modifying Protected Routes
Edit `middleware.ts`:
```typescript
export const config = {
  matcher: ["/dashboard", "/profile", "/your-route"],
};
```

---

## Common Patterns

### Accessing User Metadata
```typescript
const { user } = useSupabaseUser();

// Access custom fields
const name = user?.user_metadata?.name;
const role = user?.user_metadata?.role;
const onboardingCompleted = user?.user_metadata?.onboardingCompleted;
```

### Updating User Metadata
```typescript
const supabase = createClient();
const { data, error } = await supabase.auth.updateUser({
  data: {
    name: "New Name",
    onboardingCompleted: true,
  },
});
```

### Listening to Auth State Changes
```typescript
useEffect(() => {
  const supabase = createClient();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log("Auth event:", event);
      console.log("Session:", session);
      
      if (event === "SIGNED_IN") {
        // Handle sign in
      }
      if (event === "SIGNED_OUT") {
        // Handle sign out
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

### Conditional Rendering Based on Auth
```typescript
const { user, loading } = useSupabaseUser();

if (loading) {
  return <LoadingSpinner />;
}

if (!user) {
  return (
    <div>
      <Link href="/login">Please log in</Link>
    </div>
  );
}

return <AuthenticatedContent user={user} />;
```

### Protecting Client Components
```typescript
"use client";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  
  return <div>Protected content</div>;
}
```

### Making Authenticated API Calls
```typescript
async function fetchProtectedData() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch("/api/protected-route", {
    headers: {
      "Authorization": `Bearer ${session?.access_token}`,
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
}
```

### Error Handling
```typescript
const supabase = createClient();
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  // Handle specific errors
  switch (error.message) {
    case "Invalid login credentials":
      toast.error("Wrong email or password");
      break;
    case "Email not confirmed":
      toast.error("Please verify your email");
      break;
    default:
      toast.error("An error occurred");
  }
  return;
}

// Success
toast.success("Logged in!");
```

---

## 🔒 Security Best Practices

1. **Never expose service role key on client side**
   - Only use `NEXT_PUBLIC_SUPABASE_ANON_KEY` on client
   - Use `SUPABASE_SERVICE_ROLE_KEY` only in server code

2. **Always validate sessions server-side**
   - Don't trust client-side auth state for sensitive operations
   - Verify tokens in API routes

3. **Use Row Level Security (RLS) in Supabase**
   - Enable RLS on all tables
   - Create policies for data access

4. **Refresh sessions regularly**
   - The middleware handles this automatically
   - Sessions expire after a period of inactivity

---

## 🐛 Troubleshooting

### User is null even after login
- Check that cookies are enabled
- Verify middleware is running
- Check browser console for errors

### Infinite redirect loop
- Ensure login/signup pages are not in protected routes
- Check middleware matcher configuration

### Session not persisting
- Verify middleware is properly configured
- Check that cookies are not being blocked
- Ensure `updateSession` is called in middleware

### TypeScript errors
```typescript
import { User } from "@supabase/supabase-js";

const [user, setUser] = useState<User | null>(null);
```

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

**Last Updated:** November 2, 2025
