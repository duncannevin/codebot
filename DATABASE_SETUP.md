# Database Setup for User Progress

This guide explains how to set up the database table for tracking user progress.

## Step 1: Run the Migration in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_create_user_progress.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

Alternatively, you can use the Supabase CLI:

```bash
# If you have Supabase CLI installed
supabase db push
```

## Step 2: Verify the Table

After running the migration, verify the table was created:

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `user_progress` table with the following columns:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `current_level` (INTEGER)
   - `completed_levels` (INTEGER array)
   - `total_moves` (INTEGER)
   - `total_time` (INTEGER, in seconds)
   - `best_scores` (JSONB)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

## Step 3: Verify Row Level Security (RLS)

The migration automatically sets up RLS policies so users can only access their own progress:

- Users can view their own progress
- Users can insert their own progress
- Users can update their own progress

You can verify this in **Authentication** > **Policies** in your Supabase dashboard.

## What Gets Saved

The system automatically saves:
- **Current level**: The highest level the user has reached
- **Completed levels**: Array of all levels the user has completed
- **Best scores**: Best moves and time for each completed level
- **Total moves**: Cumulative moves across all levels
- **Total time**: Cumulative time across all levels

## API Endpoints

- `GET /api/user/progress` - Get user's current progress
- `POST /api/user/progress` - Save user's progress (manual)
- `POST /api/user/progress/complete` - Update progress when a level is completed

Progress is automatically saved when:
- A user completes a level (reaches the goal)
- A user clicks "Next Level" in the win modal

Progress is automatically loaded when:
- A user logs in and navigates to the game

