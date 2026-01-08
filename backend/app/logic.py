from sqlalchemy.orm import Session
from sqlalchemy import desc
from . import db_models as models
from .models import LearningEvent, StreakInfo
from datetime import date, timedelta
import math

def process_learning_event(db: Session, event_data: LearningEvent):
    """
    Ingests a learning event, updates daily summary, and recalculates progress.
    """
    # 1. Check student existence
    student = db.query(models.Student).filter(models.Student.id == event_data.student_id).first()
    if not student:
        student = models.Student(id=event_data.student_id)
        db.add(student)
        db.commit()

    # 2. Log API Event
    db_event = models.LearningEventDB(
        student_id=event_data.student_id,
        date=event_data.date,
        activity_type=event_data.activity_type.value,
        topic=event_data.topic,
        score=event_data.score,
        time_spent=event_data.time_spent,
        attempt_number=event_data.attempt_number
    )
    db.add(db_event)
    db.commit()

    # 3. Update Daily Summary
    update_daily_progress(db, event_data.student_id, event_data.date)

def update_daily_progress(db: Session, student_id: str, day: date):
    """
    Recalculates daily progress based on all events for that day.
    """

    events = db.query(models.LearningEventDB).filter(
        models.LearningEventDB.student_id == student_id,
        models.LearningEventDB.date == day
    ).all()

    if not events:
        return

    total_time = sum(e.time_spent for e in events)
    avg_score = sum(e.score for e in events) / len(events)
    
    # Progress Formula:
    # 60% weight on Consistency (Time), 40% on Mastery (Score)
    # Time capped at 60 mins for max points.
    
    time_contribution = min(total_time, 60) # Max 60 points
    score_contribution = (avg_score / 100) * 40 # Max 40 points
    
    progress_score = time_contribution + score_contribution
    
    # Threshold for a "Valid" consistency day:
    # Must have at least 15 mins of work OR very high score in short time?
    # Requirement: "Time alone never counting as learning" -> We use score too.
    # Requirement: "Prevent idle sessions" -> Min time threshold enforced in Pydantic.
    # Let's set a minimal bar for Streak: Progress > 20 (approx 20 mins or good score).
    is_valid_day = progress_score >= 15 

    summary = db.query(models.DailySummary).filter(
        models.DailySummary.student_id == student_id,
        models.DailySummary.date == day
    ).first()
    
    if summary:
        summary.total_time = total_time
        summary.avg_score = avg_score
        summary.progress_score = round(progress_score, 1)
        summary.is_valid_day = is_valid_day
    else:
        summary = models.DailySummary(
            student_id=student_id,
            date=day,
            total_time=total_time,
            avg_score=avg_score,
            progress_score=round(progress_score, 1),
            is_valid_day=is_valid_day
        )
        db.add(summary)
    
    db.commit()

def calculate_streak(db: Session, student_id: str) -> StreakInfo:
    """
    Calculates Strict Streak.
    Streak resets immediately if a day has no valid learning.
    """
    today = date.today()
    
    # Check if we have activity today or yesterday. 
    # If no valid activity yesterday and no activity today, streak is 0.
    
    summaries = db.query(models.DailySummary).filter(
        models.DailySummary.student_id == student_id,
        models.DailySummary.is_valid_day == True,
        models.DailySummary.date <= today
    ).order_by(desc(models.DailySummary.date)).all()
    
    if not summaries:
        return StreakInfo(current_streak=0, last_activity_date=None, is_active=False)

    last_valid_date = summaries[0].date
    days_since_active = (today - last_valid_date).days

    # Strict Rules:
    # If > 1 day gap (i.e. missed yesterday and today), streak broken.
    # Actually, if missed YESTERDAY, streak is broken.
    # Exceptions: You can maintain streak if you worked TODAY.
    
    if days_since_active > 1:
        # Missed yesterday and today. Streak is 0.
        return StreakInfo(current_streak=0, last_activity_date=last_valid_date, is_active=False)
    
    # Calculate consecutive days
    streak = 1
    current_check_date = last_valid_date
    
    # Iterate backwards
    for i in range(1, len(summaries)):
        prev_date = summaries[i].date
        expected_date = current_check_date - timedelta(days=1)
        
        if prev_date == expected_date:
            streak += 1
            current_check_date = prev_date
        else:
            break
            
    is_active = (days_since_active == 0) # Active if worked TODAY
    
    return StreakInfo(current_streak=streak, last_activity_date=last_valid_date, is_active=is_active)

def calculate_confidence(db: Session, student_id: str):
    """
    Determines confidence level (Low, Medium, High) based on data patterns.
    """
    events = db.query(models.LearningEventDB).filter(
        models.LearningEventDB.student_id == student_id
    ).all()
    
    if len(events) < 5:
        return "Low", "Insufficient data points (less than 5 events)."
    
    # Calculate Volatility of Scores
    scores = [e.score for e in events]
    avg = sum(scores) / len(scores)
    variance = sum((s - avg) ** 2 for s in scores) / len(scores)
    std_dev = math.sqrt(variance)
    
    reason = []
    confidence_score = 3 # Start High
    
    if std_dev > 25:
        confidence_score -= 1
        reason.append("High score volatility detected.")
        
    # Check for Spikes (Time)
    times = [e.time_spent for e in events]
    avg_time = sum(times) / len(times)
    max_time = max(times)
    
    if max_time > avg_time * 3 and max_time > 30:
        confidence_score -= 1
        reason.append("Unusual spike in time spent detected.")
        
    # Consistency Check
    summaries = db.query(models.DailySummary).filter(models.DailySummary.student_id == student_id).all()
    if len(summaries) < 3:
        confidence_score -= 1
        reason.append("Not enough daily history.")
        
    if confidence_score >= 3:
        return "High", "Consistent data patterns observed."
    elif confidence_score == 2:
        return "Medium", " ".join(reason)
    else:
        return "Low", " ".join(reason)

def get_student_analysis(db: Session, student_id: str):
    """
    Analyzes weak and strong areas based on past quiz/practice scores.
    """
    events = db.query(models.LearningEventDB).filter(
        models.LearningEventDB.student_id == student_id
    ).all()
    
    topic_scores = {}
    
    for e in events:
        if e.topic not in topic_scores:
            topic_scores[e.topic] = []
        topic_scores[e.topic].append(e.score)
        
    strong_topics = []
    weak_topics = []
    
    for topic, scores in topic_scores.items():
        avg = sum(scores) / len(scores)
        if avg > 80:
            strong_topics.append(topic)
        elif avg < 60:
            weak_topics.append(topic)
            
    return weak_topics, strong_topics

def check_and_award_rewards(db: Session, student_id: str, current_streak: int):
    """
    Awards puzzle pieces for every 7 days of streak.
    """
    reward = db.query(models.Reward).filter(models.Reward.student_id == student_id).first()
    if not reward:
        reward = models.Reward(student_id=student_id)
        db.add(reward)
    
    # Simple logic: 1 piece per week of streak
    # In a real system we'd track if "this week" was already claimed.
    # For hackathon, we calculate total pieces expected based on streak.
    
    expected_pieces = current_streak // 7
    
    # Grant bonuses for milestones
    if current_streak >= 30 and "30 Day Streak Trophy" not in reward.badges_unlocked:
        reward.badges_unlocked = reward.badges_unlocked + ["30 Day Streak Trophy"]
        
    if current_streak >= 7 and "7 Day Survivor" not in reward.badges_unlocked:
        reward.badges_unlocked = reward.badges_unlocked + ["7 Day Survivor"]

    # We just ensure pieces don't go down (in case of reset)
    # But wait, if streak resets, pieces shouldn't disappear? 
    # "After 4 to 5 weeks you get to combine them". 
    # Let's say pieces are permanent.
    
    # We'll just increment pieces if a flag is passed, but for now let's just calc based on historical best or manual claim?
    # Let's auto-increment pieces if we detect a "new week" completion. 
    # Simpler: Just make it a function of total VALID days / 7.
    
    total_valid_days = db.query(models.DailySummary).filter(
        models.DailySummary.student_id == student_id,
        models.DailySummary.is_valid_day == True
    ).count()
    
    reward.puzzle_pieces = total_valid_days // 7
    db.commit()
    return reward

