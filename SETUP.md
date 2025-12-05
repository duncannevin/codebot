# Code Bot Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A GitHub account (for OAuth)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [Supabase](https://app.supabase.com) and create a new project
2. Wait for your project to be provisioned
3. Go to **Settings** > **API** in your Supabase dashboard
4. Copy your **Project URL** and **anon/public key**

## Step 3: Configure GitHub OAuth

### In GitHub:

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name**: Code Bot (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for local dev)
   - **Authorization callback URL**: 
     - For local: `http://localhost:3000/auth/callback`
     - For production: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**

### In Supabase:

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Find **GitHub** and enable it
3. Enter your GitHub **Client ID** and **Client Secret**
4. Save the changes

## Step 4: Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace the values with your actual Supabase credentials.

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test Authentication

1. Navigate to `/login`
2. Click "Continue with GitHub"
3. Authorize the application
4. You should be redirected to `/game` after successful authentication

## Production Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
4. Update GitHub OAuth callback URL to include your Supabase callback URL
5. Deploy!

## Troubleshooting

### "Invalid redirect URL" error

- Make sure your GitHub OAuth callback URL matches exactly what's configured in Supabase
- For local development, use `http://localhost:3000/auth/callback`
- For production, use `https://your-project-ref.supabase.co/auth/v1/callback`

### Authentication not working

- Verify your environment variables are set correctly
- Check that GitHub OAuth is enabled in Supabase
- Ensure your GitHub OAuth app callback URL is correct
- Check browser console for errors

### Session not persisting

- Make sure cookies are enabled in your browser
- Check that middleware is properly configured
- Verify Supabase project settings allow your domain

