from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import engine, get_db, Base
from . import models, logic, db_models
from fastapi.middleware.cors import CORSMiddleware

# Initialize DB
db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Progress Tracker",
    description="Backend for Build2Break Hackathon Project",
    version="1.0.0"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "System is running", "status": "healthy"}

@app.post("/events")
def ingest_event(event: models.LearningEvent, db: Session = Depends(get_db)):
    """
    Ingest a raw learning event. 
    Triggers validation, processing, and progress updates.
    """
    try:
        logic.process_learning_event(db, event)
        return {"status": "accepted", "message": "Event processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/auth/student/{roll_no}", response_model=models.Student)
def login_student(roll_no: str, db: Session = Depends(get_db)):
    student = db.query(db_models.Student).filter(db_models.Student.id == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.get("/courses/{student_id}", response_model=list[models.Course])
def get_student_courses(student_id: str, db: Session = Depends(get_db)):
    enrollments = db.query(db_models.Enrollment).filter(db_models.Enrollment.student_id == student_id).all()
    courses = [e.course for e in enrollments]
    return courses

@app.get("/test/daily")
def get_daily_test():
    # Mock Daily Test
    return {
        "id": 101,
        "question": "What is the complexity of Binary Search?",
        "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        "correct_option": 1
    }

@app.post("/test/submit")
def submit_test_score(data: models.LearningEvent, db: Session = Depends(get_db)):
    # Re-use ingestion logic but mark as test
    logic.process_learning_event(db, data)
    return {"status": "success", "message": "Test Submitted"}

@app.get("/analysis/{student_id}")
def get_analysis_report(student_id: str, db: Session = Depends(get_db)):
    weak, strong = logic.get_student_analysis(db, student_id)
    return {"weak_topics": weak, "strong_topics": strong}

@app.get("/student/{student_id}/dashboard", response_model=models.DashboardStats)
def get_dashboard_stats(student_id: str, db: Session = Depends(get_db)):
    """
    Returns aggregated dashboard data: Progress, Streak, Confidence, Rewards.
    """
    # Get Student
    student = db.query(db_models.Student).filter(db_models.Student.id == student_id).first()
    
    # Get Daily Progress
    summaries = db.query(db_models.DailySummary).filter(
        db_models.DailySummary.student_id == student_id
    ).order_by(db_models.DailySummary.date).all()
    
    daily_progress_data = [
        models.DailyProgress(
            date=s.date,
            total_time=s.total_time,
            avg_score=s.avg_score,
            progress_score=s.progress_score,
            is_valid_day=s.is_valid_day
        ) for s in summaries
    ]
    
    # Get Streak
    streak_info = logic.calculate_streak(db, student_id)
    
    # Update Rewards
    reward_info = logic.check_and_award_rewards(db, student_id, streak_info.current_streak)
    
    # Get Confidence
    conf_level, conf_reason = logic.calculate_confidence(db, student_id)
    
    # Get Activity Distribution
    from sqlalchemy import func
    dist_query = db.query(
        db_models.LearningEventDB.activity_type, 
        func.count(db_models.LearningEventDB.id)
    ).filter(
        db_models.LearningEventDB.student_id == student_id
    ).group_by(db_models.LearningEventDB.activity_type).all()
    
    activity_dist = [
        models.ActivityValidation(activity_type=atype, count=count) 
        for atype, count in dist_query
    ]
    
    return models.DashboardStats(
        student=models.Student.model_validate(student) if student else None,
        daily_progress=daily_progress_data,
        streak=streak_info,
        confidence_level=conf_level,
        confidence_reason=conf_reason,
        activity_distribution=activity_dist,
        reward=models.RewardInfo.model_validate(reward_info) if reward_info else None
    )
