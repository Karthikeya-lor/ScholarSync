import pytest
from datetime import date, timedelta
from app.models import LearningEvent, ActivityType
from app import logic
from app import db_models as models
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# In-memory DB for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    models.Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        models.Base.metadata.drop_all(bind=engine)

def test_minimum_effort_validation():
    """Test that time_spent < 1 minute raises ValueError"""
    with pytest.raises(ValueError):
        LearningEvent(
            student_id="test_student",
            date=date.today(),
            activity_type=ActivityType.PRACTICE,
            topic="Math",
            score=100,
            time_spent=0, # Invalid
            attempt_number=1
        )

def test_streak_logic_consecutive_days(db):
    """Test strict streak increment on consecutive days"""
    student_id = "streak_student"
    
    # Day 1: 2 days ago
    logic.process_learning_event(db, LearningEvent(
        student_id=student_id,
        date=date.today() - timedelta(days=2),
        activity_type=ActivityType.PRACTICE,
        topic="A", score=50, time_spent=20, attempt_number=1
    ))
    
    # Day 2: Yesterday
    logic.process_learning_event(db, LearningEvent(
        student_id=student_id,
        date=date.today() - timedelta(days=1),
        activity_type=ActivityType.PRACTICE,
        topic="B", score=50, time_spent=20, attempt_number=1
    ))
    
    # Day 3: Today
    logic.process_learning_event(db, LearningEvent(
        student_id=student_id,
        date=date.today(),
        activity_type=ActivityType.PRACTICE,
        topic="C", score=50, time_spent=20, attempt_number=1
    ))
    
    streak_info = logic.calculate_streak(db, student_id)
    assert streak_info.current_streak == 3
    assert streak_info.is_active == True

def test_streak_broken_if_day_missed(db):
    """Test streak resets if a day is missed"""
    student_id = "broken_streak_student"
    
    # Active 3 days ago
    logic.process_learning_event(db, LearningEvent(
        student_id=student_id,
        date=date.today() - timedelta(days=3),
        activity_type=ActivityType.PRACTICE,
        topic="A", score=50, time_spent=20, attempt_number=1
    ))
    
    # Missed 2 days ago and Yesterday
    # Active Today
    logic.process_learning_event(db, LearningEvent(
        student_id=student_id,
        date=date.today(),
        activity_type=ActivityType.PRACTICE,
        topic="C", score=50, time_spent=20, attempt_number=1
    ))
    
    streak_info = logic.calculate_streak(db, student_id)
    # Streak should be 1 (only today counts because chain was broken)
    assert streak_info.current_streak == 1 
    assert streak_info.is_active == True

def test_no_grace_period(db):
    """Test strictness: Missed yesterday -> Streak 0"""
    student_id = "grace_student"
    
    # Active 2 days ago
    logic.process_learning_event(db, LearningEvent(
        student_id=student_id,
        date=date.today() - timedelta(days=2),
        activity_type=ActivityType.PRACTICE,
        topic="A", score=50, time_spent=20, attempt_number=1
    ))
    
    # Missed Yesterday and Today
    
    streak_info = logic.calculate_streak(db, student_id)
    assert streak_info.current_streak == 0
    assert streak_info.is_active == False
