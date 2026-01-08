from sqlalchemy import Column, Integer, String, Date, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True) # acts as Roll No
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    enrollments = relationship("Enrollment", back_populates="student")
    rewards = relationship("Reward", back_populates="student", uselist=False)

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    faculty_name = Column(String)
    schedule = Column(JSON) # e.g. {"Mon": "10:00 AM", "Wed": "2:00 PM"}
    
    enrollments = relationship("Enrollment", back_populates="course")
    content = relationship("CourseContent", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class CourseContent(Base):
    __tablename__ = "course_content"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    content_type = Column(String) # task, assignment, quiz
    details = Column(JSON) # due date, max score, etc.
    
    course = relationship("Course", back_populates="content")

class Reward(Base):
    __tablename__ = "rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"))
    puzzle_pieces = Column(Integer, default=0)
    badges_unlocked = Column(JSON, default=list) # List of strings
    
    student = relationship("Student", back_populates="rewards")

class LearningEventDB(Base):
    __tablename__ = "learning_events"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), index=True)
    date = Column(Date, index=True)
    activity_type = Column(String)
    topic = Column(String)
    score = Column(Integer)
    time_spent = Column(Integer)
    attempt_number = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), index=True)
    date = Column(Date, index=True)
    total_time = Column(Integer, default=0)
    avg_score = Column(Float, default=0.0)
    progress_score = Column(Float, default=0.0)
    is_valid_day = Column(Boolean, default=False)
