-- Run this in Supabase SQL Editor or PostgreSQL

-- 1. Classrooms
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  subject text NOT NULL,
  description text,
  faculty_id text NOT NULL,
  faculty_email text,
  created_at timestamptz DEFAULT now()
);

-- 2. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  student_name text,
  student_email text,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

-- 3. Course Materials / PDFs
CREATE TABLE IF NOT EXISTS course_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  title text NOT NULL,
  filename text NOT NULL,
  file_path text,
  doc_type text DEFAULT 'pdf', -- 'normal' or 'scanned'
  pages integer DEFAULT 0,
  chunks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Lectures
CREATE TABLE IF NOT EXISTS lectures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  title text NOT NULL,
  transcript text,
  summary text,
  department text DEFAULT 'Computer Science',
  created_at timestamptz DEFAULT now()
);

-- 5. Assignments / Quizzes
CREATE TABLE IF NOT EXISTS assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  questions text, -- JSON string containing MCQ and SAQ questions
  keywords text,  -- JSON string or comma-separated list
  due_date timestamptz DEFAULT (now() + interval '7 days'),
  status text DEFAULT 'published',
  author text DEFAULT 'Faculty',
  created_at timestamptz DEFAULT now()
);

-- 6. Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  student_name text,
  student_email text,
  content text,  -- JSON string of answers
  status text DEFAULT 'submitted',
  grade text,
  score numeric DEFAULT 0,
  feedback text,
  submitted_at timestamptz DEFAULT now()
);

-- 7. Chatbot Logs
CREATE TABLE IF NOT EXISTS chatbot_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  student_id text,
  query text,
  response text,
  timestamp timestamptz DEFAULT now()
);

-- 8. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  author text DEFAULT 'Faculty',
  created_at timestamptz DEFAULT now()
);

-- Disable RLS for demo mode
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE lectures DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- Grant permissions to public/anon
GRANT ALL ON classrooms TO anon, authenticated;
GRANT ALL ON enrollments TO anon, authenticated;
GRANT ALL ON course_materials TO anon, authenticated;
GRANT ALL ON lectures TO anon, authenticated;
GRANT ALL ON assignments TO anon, authenticated;
GRANT ALL ON submissions TO anon, authenticated;
GRANT ALL ON chatbot_logs TO anon, authenticated;
GRANT ALL ON announcements TO anon, authenticated;
