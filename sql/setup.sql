-- Run this in Supabase SQL Editor

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS lectures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  transcript text,
  summary text,
  department text DEFAULT 'Computer Science',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  description text,
  questions text,
  lecture_id uuid,
  due_date timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid,
  student_id text,
  content text,
  status text DEFAULT 'submitted',
  grade text,
  submitted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id text,
  query text,
  response text,
  timestamp timestamptz DEFAULT now()
);

-- Add missing columns if tables already exist
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS department text DEFAULT 'Computer Science';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS questions text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE chatbot_logs ADD COLUMN IF NOT EXISTS timestamp timestamptz DEFAULT now();

-- Disable RLS on all tables (demo mode)
ALTER TABLE lectures DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_logs DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon role
GRANT ALL ON lectures TO anon;
GRANT ALL ON assignments TO anon;
GRANT ALL ON submissions TO anon;
GRANT ALL ON chatbot_logs TO anon;
GRANT ALL ON lectures TO authenticated;
GRANT ALL ON assignments TO authenticated;
GRANT ALL ON submissions TO authenticated;
GRANT ALL ON chatbot_logs TO authenticated;
