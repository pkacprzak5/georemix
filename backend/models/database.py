from datetime import datetime
from typing import Any, List
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import inspect

db = SQLAlchemy()


def init_database(app):
    """
    Initialize database tables safely, handling race conditions with multiple workers.
    This function should be called after db.init_app(app) in the application context.
    """
    try:
        # Check if tables already exist to avoid race conditions
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if not existing_tables:
            print("Creating database tables...")
            db.create_all()
            print("Database tables created successfully")
        else:
            print(f"Database tables already exist: {existing_tables}")
            # Call create_all anyway - it's safe and will create any missing tables
            db.create_all()
            print("Database schema verified")
            
    except Exception as e:
        # This can happen with race conditions when multiple workers start simultaneously
        print(f"Database initialization note: {e}")
        
        # Verify that tables exist (may have been created by another worker)
        try:
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            
            if tables:
                print(f"Tables verified after race condition: {tables}")
            else:
                # If no tables exist, this is a real error
                print("ERROR: Database initialization failed - no tables found")
                raise Exception("Database initialization failed")
                
        except Exception as verify_error:
            print(f"CRITICAL: Database verification error: {verify_error}")
            raise


class Player(db.Model):  # type: ignore
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(db.String(64), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow, nullable=False)

    round_scores: Mapped[List["RoundScore"]] = relationship(
        "RoundScore", back_populates="player", cascade="all, delete-orphan"
    )

    def to_dict(self, include_scores: bool = False) -> dict[str, Any]:
        completed_scores = list(self.round_scores)
        total_score = sum(score.score for score in completed_scores if score.score)
        total_time = sum(score.time for score in completed_scores if score.time)
        min_distance = min(
            (score.min_distance for score in completed_scores if score.min_distance),
            default=0
        )

        data = {
            "id": self.id,
            "username": self.username,
            "createdAt": self.created_at.isoformat(),
            "roundsCompleted": len(completed_scores),
            "overallScore": total_score,
            "overallTime": total_time,
            "minDistance": min_distance,
        }

        if include_scores:
            data["roundScores"] = [score.to_dict() for score in completed_scores]

        return data


class RoundScore(db.Model):  # type: ignore
    __tablename__ = "round_scores"

    id: Mapped[int] = mapped_column(primary_key=True)
    player_id: Mapped[int] = mapped_column(db.ForeignKey("players.id"), nullable=False)
    round_number: Mapped[int] = mapped_column(nullable=False)
    min_distance: Mapped[float | None] = mapped_column(db.Float, nullable=True)
    score: Mapped[float | None] = mapped_column(db.Float, nullable=True)
    time: Mapped[float | None] = mapped_column(db.Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow, nullable=False)

    player: Mapped["Player"] = relationship("Player", back_populates="round_scores")

    __table_args__ = (
        db.Index("ix_round_scores_round", "round_number"),
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "playerId": self.player_id,
            "username": self.player.username if self.player else None,
            "roundNumber": self.round_number,
            "minDistance": self.min_distance,
            "score": self.score,
            "time": self.time,
            "createdAt": self.created_at.isoformat(),
        }
