from sqlalchemy.orm import Session
from app import db_models as models
from app.database import SessionLocal, engine
from datetime import date, timedelta
import random

# Init DB
models.Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    
    # 1. Create Demo Student
    student_id = "123"
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        print(f"Creating Student {student_id}...")
        student = models.Student(id=student_id, name="Yaswanth K")
        # Init Reward
        reward = models.Reward(student_id=student_id, puzzle_pieces=2, badges_unlocked=["Early Bird"])
        db.add(student)
        db.add(reward)
    
    # 2. Create Courses
    courses_data = [
        {
            "title": "Advanced Python",
            "description": "Deep dive into Python internals and AsyncIO.",
            "faculty_name": "Dr. Smith",
            "schedule": {"Mon": "10:00 AM", "Wed": "10:00 AM"}
        },
        {
            "title": "Data Structures",
            "description": "Algorithms, Trees, Graphs and more.",
            "faculty_name": "Prof. Johnson",
            "schedule": {"Tue": "2:00 PM", "Thu": "2:00 PM"}
        },
        {
            "title": "System Design",
            "description": "Scalable systems and microservices.",
            "faculty_name": "Dr. Emily",
            "schedule": {"Fri": "11:00 AM"}
        }
    ]
    
    for c_data in courses_data:
        course = db.query(models.Course).filter(models.Course.title == c_data["title"]).first()
        if not course:
            print(f"Creating Course: {c_data['title']}")
            course = models.Course(**c_data)
            db.add(course)
            db.commit() # commit to get ID
            
            # Enroll Student
            enrollment = models.Enrollment(student_id=student_id, course_id=course.id)
            db.add(enrollment)
            
            # Add Content
            content = models.CourseContent(
                course_id=course.id,
                title=f"Intro to {c_data['title']}",
                content_type="task",
                details={"due_date": "2026-01-20", "points": 100}
            )
            db.add(content)
            
    # 3. Create Fake History (Last 30 days)
    # simulate some gaps and streaks
    today = date.today()
    print("Generating History...")
    
    # Clear old events for clean seed
    db.query(models.LearningEventDB).filter(models.LearningEventDB.student_id == student_id).delete()
    db.query(models.DailySummary).filter(models.DailySummary.student_id == student_id).delete()
    
    for i in range(30, -1, -1):
        day = today - timedelta(days=i)
        
        # Skip random days to break streak or show realism
        if i in [2, 5, 12, 13, 20]: 
            continue
            
        # Add Event
        event = models.LearningEventDB(
            student_id=student_id,
            date=day,
            activity_type=random.choice(["practice", "quiz", "revision"]),
            topic=random.choice(["Python", "React", "Docker", "SQL"]),
            score=random.randint(60, 100),
            time_spent=random.randint(20, 90),
            attempt_number=1
        )
        db.add(event)
        
        # Add Summary (simplified logic for seeding)
        summary = models.DailySummary(
            student_id=student_id,
            date=day,
            total_time=event.time_spent,
            avg_score=float(event.score),
            progress_score=min(event.time_spent, 60) + (event.score * 0.4),
            is_valid_day=True
        )
        db.add(summary)
        
    db.commit()
    print("Database Seeded Successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
