import sys
import os
import json
import asyncio
from httpx import ASGITransport, AsyncClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.main import app
from app.services.db import db


async def run_acceptance_test():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        print("==================================================")
        print("STAGE 1: Acceptance Test — Faculty & Student Flow")
        print("==================================================")

        # 1. Faculty login
        fac_email = "teacher@gmail.com"
        fac_login_res = await client.post("/auth/login", json={
            "email": fac_email,
            "password": "anypassword123",
            "role": "faculty"
        })
        assert fac_login_res.status_code == 200, f"Faculty login failed: {fac_login_res.text}"
        fac_user = fac_login_res.json()
        print(f"[PASS] 1. Faculty logged in: {fac_user['full_name']} (ID: {fac_user['id']})")

        # 2. Faculty creates classroom called 'Database Management Systems'
        create_class_res = await client.post("/classrooms/", json={
            "name": "Database Management Systems",
            "subject": "CS301 / DBMS",
            "description": "Comprehensive course covering relational algebra, SQL, indexing and transactions.",
            "faculty_id": fac_user["id"],
            "faculty_email": fac_user["email"]
        })
        assert create_class_res.status_code == 200, f"Classroom creation failed: {create_class_res.text}"
        classroom = create_class_res.json()
        join_code = classroom["code"]
        class_id = classroom["id"]
        print(f"[PASS] 2. Classroom created: '{classroom['name']}' with 6-char Join Code: [{join_code}]")

        # 3. Verify classroom appears in Faculty's list
        fac_classes_res = await client.get(f"/classrooms/?faculty_id={fac_user['id']}")
        assert fac_classes_res.status_code == 200
        fac_classes = fac_classes_res.json()
        assert any(c["id"] == class_id for c in fac_classes)
        print(f"[PASS] 3. Classroom successfully retrieved in Faculty classroom list (Count: {len(fac_classes)})")

        # 4. Student login
        stu_email = "student@gmail.com"
        stu_login_res = await client.post("/auth/login", json={
            "email": stu_email,
            "password": "mypassword456",
            "role": "student"
        })
        assert stu_login_res.status_code == 200, f"Student login failed: {stu_login_res.text}"
        stu_user = stu_login_res.json()
        print(f"[PASS] 4. Student logged in: {stu_user['full_name']} (ID: {stu_user['id']})")

        # 5. Student joins classroom using the 6-character code
        join_res = await client.post("/classrooms/join", json={
            "code": join_code,
            "student_id": stu_user["id"],
            "student_name": stu_user["full_name"],
            "student_email": stu_user["email"]
        })
        assert join_res.status_code == 200, f"Student join failed: {join_res.text}"
        join_data = join_res.json()
        assert join_data["success"] is True
        print(f"[PASS] 5. Student joined classroom '{classroom['name']}' using code [{join_code}]")

        # 6. Verify classroom appears in Student's enrolled list
        stu_classes_res = await client.get(f"/classrooms/enrolled/{stu_user['id']}")
        assert stu_classes_res.status_code == 200
        stu_classes = stu_classes_res.json()
        assert any(c["id"] == class_id for c in stu_classes)
        print(f"[PASS] 6. Classroom appears in Student's enrolled dashboard (Count: {len(stu_classes)})")

        # 7. Verify student appears in Faculty's enrolled-students list
        students_res = await client.get(f"/classrooms/{class_id}/students")
        assert students_res.status_code == 200
        students_list = students_res.json()
        assert any(s["student_id"] == stu_user["id"] for s in students_list)
        print(f"[PASS] 7. Student '{stu_user['full_name']}' confirmed in Faculty's enrolled list! (Total enrolled: {len(students_list)})")

        print("\n==================================================")
        print("STAGE 2: Full Content, AI & Submission Workflow")
        print("==================================================")

        # 8. Faculty records lecture for this classroom
        lec_res = await client.post("/lectures/", json={
            "title": "Introduction to B-Trees and Normalization",
            "transcript": "Today we explored indexing using B-Trees and relational normalization into 3NF. B-Trees maintain balanced search times of O(log N).",
            "classroom_id": class_id,
            "department": "Computer Science"
        })
        assert lec_res.status_code == 200
        lec_data = lec_res.json()
        print(f"[PASS] 8. Faculty saved lecture with AI summary: '{lec_data['title']}'")

        # 9. Student retrieves lecture notes for their classroom
        stu_notes_res = await client.get(f"/lectures/?classroom_id={class_id}")
        assert stu_notes_res.status_code == 200
        notes = stu_notes_res.json()
        assert len(notes) > 0
        print(f"[PASS] 9. Student retrieves synchronized lecture notes (Count: {len(notes)})")

        # 10. Student queries AI Doubt Solver for this classroom
        doubt_res = await client.post("/chatbot/ask", json={
            "question": "What is the time complexity of B-Tree indexing?",
            "classroom_id": class_id,
            "student_id": stu_user["id"]
        })
        assert doubt_res.status_code == 200
        doubt_ans = doubt_res.json()
        print(f"[PASS] 10. AI Doubt Solver responded: {doubt_ans['response'][:90]}...")

        # 11. Faculty generates and publishes assignment
        gen_res = await client.post("/assignments/generate", json={
            "transcript": "B-Trees are balanced tree data structures. Normalization eliminates data anomalies. ACID properties guarantee consistency.",
            "title": "DBMS Quiz 1 — Trees and Normalization",
            "classroom_id": class_id
        })
        assert gen_res.status_code == 200
        gen_data = gen_res.json()

        pub_res = await client.post("/assignments/publish", json={
            "title": "DBMS Quiz 1 — Trees and Normalization",
            "description": "Weekly assessment for Database Management Systems",
            "questions": gen_data["questions_parsed"],
            "classroom_id": class_id,
            "author": fac_user["full_name"]
        })
        assert pub_res.status_code == 200
        assignment = pub_res.json()["assignment"]
        assign_id = assignment["id"]
        print(f"[PASS] 11. Faculty published assignment: '{assignment['title']}' (ID: {assign_id})")

        # 12. Student attempts and submits the assignment
        sub_res = await client.post("/assignments/submit", json={
            "assignment_id": assign_id,
            "classroom_id": class_id,
            "student_id": stu_user["id"],
            "student_name": stu_user["full_name"],
            "student_email": stu_user["email"],
            "content": [
                {"question_index": 0, "answer": "A) Uniquely identify each record"},
                {"question_index": 1, "answer": "B) By reducing data redundancy and anomalies"},
                {"question_index": 2, "answer": "A) ACID properties"}
            ]
        })
        assert sub_res.status_code == 200
        sub_data = sub_res.json()["submission"]
        print(f"[PASS] 12. Student submitted assignment! Grade: {sub_data['grade']}, Score: {sub_data['score']}%")

        # 13. Faculty retrieves submissions and views student performance
        fac_subs_res = await client.get(f"/submissions?classroom_id={class_id}")
        assert fac_subs_res.status_code == 200
        fac_subs = fac_subs_res.json()
        assert any(s["student_id"] == stu_user["id"] for s in fac_subs)
        print(f"[PASS] 13. Faculty views real student submission for '{assignment['title']}' (Total submissions: {len(fac_subs)})")

        # 14. Faculty analytics update with real metrics
        fac_analytics_res = await client.get(f"/classrooms/analytics/faculty/{fac_user['id']}")
        assert fac_analytics_res.status_code == 200
        fac_analytics = fac_analytics_res.json()
        assert fac_analytics["total_classrooms"] >= 1
        assert fac_analytics["total_students"] >= 1
        assert fac_analytics["total_submissions"] >= 1
        print(f"[PASS] 14. Faculty analytics verified: Classrooms={fac_analytics['total_classrooms']}, Students={fac_analytics['total_students']}, Submissions={fac_analytics['total_submissions']}, Avg Score={fac_analytics['avg_score']}%")

        # 15. Student analytics & leaderboard update with earned credits
        stu_analytics_res = await client.get(f"/classrooms/analytics/student/{stu_user['id']}")
        assert stu_analytics_res.status_code == 200
        stu_analytics = stu_analytics_res.json()
        assert stu_analytics["enrolled_classrooms"] >= 1
        assert stu_analytics["completed_assignments"] >= 1
        assert stu_analytics["credits"] > 0
        print(f"[PASS] 15. Student analytics verified: Enrolled={stu_analytics['enrolled_classrooms']}, Completed={stu_analytics['completed_assignments']}, Credits={stu_analytics['credits']} pts")

        # 16. PDF Explainer query test
        explainer_res = await client.post("/materials/query", json={
            "classroom_id": class_id,
            "query": "Explain database indexing with B-Trees"
        })
        assert explainer_res.status_code == 200
        explainer_data = explainer_res.json()
        assert "answer" in explainer_data
        assert "realworld" in explainer_data
        assert "code" in explainer_data
        assert "why" in explainer_data
        assert "next" in explainer_data
        print(f"[PASS] 16. 5-Section PDF AI Explainer verified: Answer, RealWorld, Code, Why, Next generated successfully!")

        print("\n==================================================")
        print("ALL ACCEPTANCE & INTEGRATION TESTS PASSED 100%!")
        print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_acceptance_test())
