from datetime import date as dt_date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
import enum

# Enums
class ActivityType(str, enum.Enum):
    QUIZ = "quiz"
    PRACTICE = "practice"
    REVISION = "revision"
    TEST = "test" # New type for Daily Test

# --- Core Learning Models ---

class LearningEvent(BaseModel):
    student_id: str = Field(..., description="Unique identifier for the student")
    date: dt_date = Field(..., description="Date of the activity (YYYY-MM-DD)")
    activity_type: ActivityType = Field(..., description="Type of learning activity")
    topic: str = Field(..., min_length=1, description="Subject topic")
    score: int = Field(..., ge=0, le=100, description="Score achieved (0-100)")
    time_spent: int = Field(..., gt=0, description="Time spent in minutes")
    attempt_number: int = Field(..., ge=1, description="Attempt count for this session")

    @field_validator('time_spent')
    def minimum_effort(cls, v):
        if v < 1: 
            raise ValueError('Time spent must be at least 1 minute')
        return v

# --- Expansion Models (Courses, Rewards) ---

class CourseBase(BaseModel):
    title: str
    description: str
    faculty_name: str
    schedule: Dict[str, str]

class Course(CourseBase):
    id: int
    content: List['CourseContent'] = []
    class Config:
        from_attributes = True

class CourseContent(BaseModel):
    id: int
    title: str
    content_type: str
    details: Dict[str, Any]
    class Config:
        from_attributes = True

class Student(BaseModel):
    id: str # Roll No
    name: str
    class Config:
        from_attributes = True

class RewardInfo(BaseModel):
    puzzle_pieces: int
    badges_unlocked: List[str]
    class Config:
        from_attributes = True

class DailyTest(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_option: int

# --- Response Models ---

class DailyProgress(BaseModel):
    date: dt_date
    total_time: int
    avg_score: float
    progress_score: float
    is_valid_day: bool

class StreakInfo(BaseModel):
    current_streak: int
    last_activity_date: Optional[dt_date]
    is_active: bool

class ActivityValidation(BaseModel):
    activity_type: str
    count: int

class DashboardStats(BaseModel):
    student: Optional[Student]
    daily_progress: list[DailyProgress]
    streak: StreakInfo
    confidence_level: str
    confidence_reason: str
    activity_distribution: list[ActivityValidation]
    reward: Optional[RewardInfo]
