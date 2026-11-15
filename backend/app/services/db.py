import os
import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "classroom.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS classrooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        subject TEXT NOT NULL,
        description TEXT,
        faculty_id TEXT NOT NULL,
        faculty_email TEXT,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        classroom_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT,
        student_email TEXT,
        enrolled_at TEXT NOT NULL,
        UNIQUE(classroom_id, student_id),
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_materials (
        id TEXT PRIMARY KEY,
        classroom_id TEXT NOT NULL,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT,
        doc_type TEXT DEFAULT 'pdf',
        pages INTEGER DEFAULT 0,
        chunks INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lectures (
        id TEXT PRIMARY KEY,
        classroom_id TEXT,
        title TEXT NOT NULL,
        transcript TEXT,
        summary TEXT,
        department TEXT DEFAULT 'Computer Science',
        created_at TEXT NOT NULL,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        classroom_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        questions TEXT,
        keywords TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'published',
        author TEXT DEFAULT 'Faculty',
        created_at TEXT NOT NULL,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        classroom_id TEXT,
        student_id TEXT NOT NULL,
        student_name TEXT,
        student_email TEXT,
        content TEXT,
        status TEXT DEFAULT 'submitted',
        grade TEXT,
        score REAL DEFAULT 0,
        feedback TEXT,
        submitted_at TEXT NOT NULL,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chatbot_logs (
        id TEXT PRIMARY KEY,
        classroom_id TEXT,
        student_id TEXT,
        query TEXT,
        response TEXT,
        timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        classroom_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        author TEXT DEFAULT 'Faculty',
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()


init_db()


class DatabaseService:
    # ── CLASSROOMS ──────────────────────────────────────────────────────────

    @staticmethod
    def create_classroom(name: str, subject: str, description: str, faculty_id: str, faculty_email: str, code: str) -> dict:
        cid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO classrooms (id, name, code, subject, description, faculty_id, faculty_email, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (cid, name, code.upper(), subject, description, faculty_id, faculty_email, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM classrooms WHERE id = ?", (cid,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_classroom_by_id(classroom_id: str) -> Optional[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM classrooms WHERE id = ?", (classroom_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_classroom_by_code(code: str) -> Optional[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM classrooms WHERE UPPER(code) = UPPER(?)", (code.strip(),))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def list_classrooms(faculty_id: Optional[str] = None) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if faculty_id:
            cursor.execute("SELECT * FROM classrooms WHERE faculty_id = ? ORDER BY created_at DESC", (faculty_id,))
        else:
            cursor.execute("SELECT * FROM classrooms ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── ENROLLMENTS ─────────────────────────────────────────────────────────

    @staticmethod
    def enroll_student(classroom_id: str, student_id: str, student_name: str, student_email: str) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM enrollments WHERE classroom_id = ? AND student_id = ?",
            (classroom_id, student_id)
        )
        existing = cursor.fetchone()
        if existing:
            conn.close()
            return dict(existing)

        eid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        cursor.execute(
            """INSERT INTO enrollments (id, classroom_id, student_id, student_name, student_email, enrolled_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (eid, classroom_id, student_id, student_name, student_email, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM enrollments WHERE id = ?", (eid,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_enrolled_classrooms(student_id: str) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """SELECT c.*, e.enrolled_at 
               FROM classrooms c
               JOIN enrollments e ON c.id = e.classroom_id
               WHERE e.student_id = ?
               ORDER BY e.enrolled_at DESC""",
            (student_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_enrolled_students(classroom_id: str) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM enrollments WHERE classroom_id = ? ORDER BY enrolled_at DESC",
            (classroom_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── COURSE MATERIALS / PDFS ─────────────────────────────────────────────

    @staticmethod
    def save_material(classroom_id: str, title: str, filename: str, file_path: str, doc_type: str = "pdf", pages: int = 0, chunks: int = 0) -> dict:
        mid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO course_materials (id, classroom_id, title, filename, file_path, doc_type, pages, chunks, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (mid, classroom_id, title, filename, file_path, doc_type, pages, chunks, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM course_materials WHERE id = ?", (mid,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_materials(classroom_id: Optional[str] = None) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if classroom_id:
            cursor.execute("SELECT * FROM course_materials WHERE classroom_id = ? ORDER BY created_at DESC", (classroom_id,))
        else:
            cursor.execute("SELECT * FROM course_materials ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_material_by_id(material_id: str) -> Optional[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM course_materials WHERE id = ?", (material_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    # ── LECTURES ────────────────────────────────────────────────────────────

    @staticmethod
    def save_lecture(title: str, transcript: str, summary: str, classroom_id: Optional[str] = None, department: str = "Computer Science") -> dict:
        lid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO lectures (id, classroom_id, title, transcript, summary, department, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (lid, classroom_id, title, transcript, summary, department, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM lectures WHERE id = ?", (lid,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_lectures(classroom_id: Optional[str] = None) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if classroom_id:
            cursor.execute("SELECT * FROM lectures WHERE classroom_id = ? ORDER BY created_at DESC", (classroom_id,))
        else:
            cursor.execute("SELECT * FROM lectures ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── ASSIGNMENTS ─────────────────────────────────────────────────────────

    @staticmethod
    def save_assignment(title: str, description: str, questions: str, keywords: str = "", classroom_id: Optional[str] = None, author: str = "Faculty", due_date: Optional[str] = None) -> dict:
        aid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO assignments (id, classroom_id, title, description, questions, keywords, due_date, status, author, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)""",
            (aid, classroom_id, title, description, questions, keywords, due_date or now, author, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM assignments WHERE id = ?", (aid,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_assignments(classroom_id: Optional[str] = None) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if classroom_id:
            cursor.execute("SELECT * FROM assignments WHERE classroom_id = ? ORDER BY created_at DESC", (classroom_id,))
        else:
            cursor.execute("SELECT * FROM assignments ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_assignment_by_id(assignment_id: str) -> Optional[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assignments WHERE id = ?", (assignment_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    # ── SUBMISSIONS ─────────────────────────────────────────────────────────

    @staticmethod
    def save_submission(assignment_id: str, student_id: str, student_name: str, student_email: str, content: str, classroom_id: Optional[str] = None, score: float = 0, grade: Optional[str] = None, feedback: Optional[str] = None) -> dict:
        sid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO submissions (id, assignment_id, classroom_id, student_id, student_name, student_email, content, status, grade, score, feedback, submitted_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?)""",
            (sid, assignment_id, classroom_id, student_id, student_name, student_email, content, grade, score, feedback, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM submissions WHERE id = ?", (sid,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_submissions(classroom_id: Optional[str] = None, assignment_id: Optional[str] = None, student_id: Optional[str] = None) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT s.*, a.title as assignment_title FROM submissions s LEFT JOIN assignments a ON s.assignment_id = a.id WHERE 1=1"
        params = []
        if classroom_id:
            query += " AND s.classroom_id = ?"
            params.append(classroom_id)
        if assignment_id:
            query += " AND s.assignment_id = ?"
            params.append(assignment_id)
        if student_id:
            query += " AND s.student_id = ?"
            params.append(student_id)
        query += " ORDER BY s.submitted_at DESC"
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def update_submission_grade(submission_id: str, grade: str, score: float, feedback: str) -> Optional[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE submissions
               SET grade = ?, score = ?, feedback = ?, status = 'graded'
               WHERE id = ?""",
            (grade, score, feedback, submission_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    # ── CHATBOT LOGS ────────────────────────────────────────────────────────

    @staticmethod
    def save_chatbot_log(student_id: str, query: str, response: str, classroom_id: Optional[str] = None) -> dict:
        lid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO chatbot_logs (id, classroom_id, student_id, query, response, timestamp)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (lid, classroom_id, student_id, query, response, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM chatbot_logs WHERE id = ?", (lid,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_chatbot_logs(student_id: Optional[str] = None, classroom_id: Optional[str] = None, limit: int = 30) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM chatbot_logs WHERE 1=1"
        params = []
        if student_id:
            query += " AND student_id = ?"
            params.append(student_id)
        if classroom_id:
            query += " AND classroom_id = ?"
            params.append(classroom_id)
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── ANNOUNCEMENTS ───────────────────────────────────────────────────────

    @staticmethod
    def save_announcement(title: str, message: str, author: str = "Faculty", classroom_id: Optional[str] = None) -> dict:
        aid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO announcements (id, classroom_id, title, message, author, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (aid, classroom_id, title, message, author, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM announcements WHERE id = ?", (aid,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_announcements(
        classroom_id: Optional[str] = None,
        classroom_ids: Optional[List[str]] = None,
        limit: int = 50
    ) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT a.*, c.name as classroom_name, c.code as classroom_code, c.subject as classroom_subject
            FROM announcements a
            LEFT JOIN classrooms c ON a.classroom_id = c.id
        """
        params = []
        if classroom_id:
            query += " WHERE (a.classroom_id = ? OR a.classroom_id IS NULL) ORDER BY a.created_at DESC LIMIT ?"
            params = [classroom_id, limit]
        elif classroom_ids is not None:
            if not classroom_ids:
                conn.close()
                return []
            placeholders = ",".join(["?"] * len(classroom_ids))
            query += f" WHERE (a.classroom_id IN ({placeholders}) OR a.classroom_id IS NULL) ORDER BY a.created_at DESC LIMIT ?"
            params = list(classroom_ids) + [limit]
        else:
            query += " ORDER BY a.created_at DESC LIMIT ?"
            params = [limit]
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── ANALYTICS ───────────────────────────────────────────────────────────

    @staticmethod
    def get_faculty_analytics(faculty_id: str) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Classrooms created
        cursor.execute("SELECT id FROM classrooms WHERE faculty_id = ?", (faculty_id,))
        c_rows = cursor.fetchall()
        class_ids = [r["id"] for r in c_rows]
        total_classrooms = len(class_ids)

        if not class_ids:
            conn.close()
            return {
                "total_classrooms": 0,
                "total_students": 0,
                "active_lectures": 0,
                "materials_count": 0,
                "assignments_count": 0,
                "total_submissions": 0,
                "avg_score": 0,
            }

        placeholders = ",".join(["?"] * len(class_ids))

        # Distinct enrolled students across faculty classrooms
        cursor.execute(
            f"SELECT COUNT(DISTINCT student_id) as student_count FROM enrollments WHERE classroom_id IN ({placeholders})",
            tuple(class_ids)
        )
        total_students = cursor.fetchone()["student_count"]

        # Lectures count
        cursor.execute(
            f"SELECT COUNT(*) as lecture_count FROM lectures WHERE classroom_id IN ({placeholders})",
            tuple(class_ids)
        )
        active_lectures = cursor.fetchone()["lecture_count"]

        # Materials count
        cursor.execute(
            f"SELECT COUNT(*) as mat_count FROM course_materials WHERE classroom_id IN ({placeholders})",
            tuple(class_ids)
        )
        materials_count = cursor.fetchone()["mat_count"]

        # Assignments count
        cursor.execute(
            f"SELECT COUNT(*) as assign_count FROM assignments WHERE classroom_id IN ({placeholders})",
            tuple(class_ids)
        )
        assignments_count = cursor.fetchone()["assign_count"]

        # Submissions count and average score
        cursor.execute(
            f"SELECT COUNT(*) as sub_count, AVG(score) as avg_sc FROM submissions WHERE classroom_id IN ({placeholders})",
            tuple(class_ids)
        )
        sub_row = cursor.fetchone()
        total_submissions = sub_row["sub_count"]
        avg_score = round(sub_row["avg_sc"] or 0, 1)

        conn.close()
        return {
            "total_classrooms": total_classrooms,
            "total_students": total_students,
            "active_lectures": active_lectures,
            "materials_count": materials_count,
            "assignments_count": assignments_count,
            "total_submissions": total_submissions,
            "avg_score": avg_score,
        }

    @staticmethod
    def get_student_analytics(student_id: str) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Enrolled classrooms
        cursor.execute("SELECT classroom_id FROM enrollments WHERE student_id = ?", (student_id,))
        enrolled_rows = cursor.fetchall()
        class_ids = [r["classroom_id"] for r in enrolled_rows]
        enrolled_count = len(class_ids)

        if not class_ids:
            conn.close()
            return {
                "enrolled_classrooms": 0,
                "available_lectures": 0,
                "materials_count": 0,
                "pending_assignments": 0,
                "completed_assignments": 0,
                "credits": 0,
                "avg_score": 0,
            }

        placeholders = ",".join(["?"] * len(class_ids))

        cursor.execute(
            f"SELECT COUNT(*) as cnt FROM lectures WHERE classroom_id IN ({placeholders})",
            tuple(class_ids)
        )
        available_lectures = cursor.fetchone()["cnt"]

        cursor.execute(
            f"SELECT COUNT(*) as cnt FROM course_materials WHERE classroom_id IN ({placeholders})",
            tuple(class_ids)
        )
        materials_count = cursor.fetchone()["cnt"]

        cursor.execute(
            f"SELECT COUNT(*) as cnt FROM assignments WHERE classroom_id IN ({placeholders})",
            tuple(class_ids)
        )
        total_assignments = cursor.fetchone()["cnt"]

        cursor.execute(
            "SELECT COUNT(*) as cnt, AVG(score) as avg_sc FROM submissions WHERE student_id = ?",
            (student_id,)
        )
        sub_row = cursor.fetchone()
        completed_assignments = sub_row["cnt"]
        avg_score = round(sub_row["avg_sc"] or 0, 1)
        pending_assignments = max(0, total_assignments - completed_assignments)

        # Calculate credits: 50 per enrolled class, 100 per completed assignment, plus bonus for scores
        credits = (enrolled_count * 50) + (completed_assignments * 100) + int(avg_score * 2)

        conn.close()
        return {
            "enrolled_classrooms": enrolled_count,
            "available_lectures": available_lectures,
            "materials_count": materials_count,
            "pending_assignments": pending_assignments,
            "completed_assignments": completed_assignments,
            "credits": credits,
            "avg_score": avg_score,
        }

    @staticmethod
    def get_leaderboard(classroom_id: Optional[str] = None) -> List[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if classroom_id:
            cursor.execute("""
                SELECT e.student_id, e.student_name, e.student_email,
                       COUNT(s.id) as submissions_count,
                       COALESCE(AVG(s.score), 0) as avg_score
                FROM enrollments e
                LEFT JOIN submissions s ON e.student_id = s.student_id AND s.classroom_id = e.classroom_id
                WHERE e.classroom_id = ?
                GROUP BY e.student_id
                ORDER BY submissions_count DESC, avg_score DESC
            """, (classroom_id,))
        else:
            cursor.execute("""
                SELECT e.student_id, e.student_name, e.student_email,
                       COUNT(s.id) as submissions_count,
                       COALESCE(AVG(s.score), 0) as avg_score
                FROM enrollments e
                LEFT JOIN submissions s ON e.student_id = s.student_id
                GROUP BY e.student_id
                ORDER BY submissions_count DESC, avg_score DESC
            """)
        rows = cursor.fetchall()
        conn.close()

        leaderboard = []
        for i, r in enumerate(rows):
            sc = round(r["avg_score"], 1)
            subs = r["submissions_count"]
            credits = (subs * 100) + int(sc * 5) + 50
            leaderboard.append({
                "rank": i + 1,
                "student_id": r["student_id"],
                "name": r["student_name"] or r["student_email"].split("@")[0].capitalize(),
                "email": r["student_email"],
                "submissions": subs,
                "avg_score": sc,
                "credits": credits,
            })
        return leaderboard


db = DatabaseService()
