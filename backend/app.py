from datetime import datetime
import json
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from typing import Optional

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://localhost:5000")
IMAGE_ENDPOINT = f"{BASE_URL}/images/"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///scores.db")
STAGE_SCORE_LIMIT = int(os.getenv("STAGE_SCORE_LIMIT", "50"))

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
CORS(app)
db = SQLAlchemy(app)


class Player(db.Model):
    __tablename__ = "players"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    stage_scores = db.relationship("StageScore", back_populates="player", cascade="all, delete-orphan")

    def to_dict(self, include_scores: bool = False):
        completed_scores = [score for score in self.stage_scores if score.is_complete]
        total_score = sum(score.total_score for score in completed_scores)
        total_time = sum(score.total_time or 0 for score in completed_scores)
        total_distance = sum(score.total_distance or 0 for score in completed_scores)

        data = {
            "id": self.id,
            "username": self.username,
            "createdAt": self.created_at.isoformat(),
            "stagesCompleted": len(completed_scores),
            "overallScore": total_score,
            "overallTime": total_time,
            "overallDistance": total_distance,
        }

        if include_scores:
            data["stageScores"] = [score.to_dict(include_levels=True) for score in completed_scores]

        return data


class Stage(db.Model):
    __tablename__ = "stages"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(128))
    total_levels = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    stage_scores = db.relationship("StageScore", back_populates="stage", cascade="all, delete-orphan")

    def to_dict(self, include_scores: bool = False):
        data = {
            "id": self.id,
            "stageId": self.code,
            "stageName": self.display_name,
            "totalLevels": self.total_levels,
            "createdAt": self.created_at.isoformat(),
        }

        if include_scores:
            ordered_scores = (
                StageScore.query
                .filter(StageScore.stage_id == self.id, StageScore.is_complete.is_(True))
                .order_by(StageScore.total_score.desc(), func.coalesce(StageScore.total_time, 1e9))
                .limit(STAGE_SCORE_LIMIT)
            )
            data["scores"] = [score.to_dict(include_levels=True) for score in ordered_scores]

        return data


class StageScore(db.Model):
    __tablename__ = "stage_scores"

    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey("players.id"), nullable=False)
    stage_id = db.Column(db.Integer, db.ForeignKey("stages.id"), nullable=False)
    total_score = db.Column(db.Float, nullable=False)
    total_time = db.Column(db.Float)
    total_distance = db.Column(db.Float)
    completed_levels = db.Column(db.Integer, default=0, nullable=False)
    is_complete = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    player = db.relationship("Player", back_populates="stage_scores")
    stage = db.relationship("Stage", back_populates="stage_scores")
    level_scores = db.relationship(
        "LevelScore",
        back_populates="stage_score",
        cascade="all, delete-orphan",
        order_by="LevelScore.order_index.asc()",
    )

    def to_dict(self, include_levels: bool = False):
        data = {
            "id": self.id,
            "playerId": self.player_id,
            "username": self.player.username if self.player else None,
            "stageId": self.stage.code if self.stage else None,
            "stageName": self.stage.display_name if self.stage else None,
            "totalScore": self.total_score,
            "totalTime": self.total_time,
            "totalDistance": self.total_distance,
            "completedLevels": self.completed_levels,
            "isComplete": self.is_complete,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
        }

        if include_levels:
            data["levels"] = [level.to_dict() for level in self.level_scores]

        return data


class LevelScore(db.Model):
    __tablename__ = "level_scores"
    __table_args__ = (
        db.Index("ix_level_scores_stage_level", "stage_score_id", "level_code"),
    )

    id = db.Column(db.Integer, primary_key=True)
    stage_score_id = db.Column(db.Integer, db.ForeignKey("stage_scores.id"), nullable=False)
    level_code = db.Column(db.String(64), nullable=False)
    level_name = db.Column(db.String(128))
    order_index = db.Column(db.Integer)
    score = db.Column(db.Float)
    time_taken = db.Column(db.Float)
    distance = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    stage_score = db.relationship("StageScore", back_populates="level_scores")

    def to_dict(self):
        return {
            "id": self.id,
            "stageScoreId": self.stage_score_id,
            "levelId": self.level_code,
            "levelName": self.level_name,
            "order": self.order_index,
            "score": self.score,
            "time": self.time_taken,
            "distance": self.distance,
            "createdAt": self.created_at.isoformat(),
        }


def _parse_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _get_player(username: str) -> Optional[Player]:
    return Player.query.filter_by(username=username).first()


def _get_or_create_stage(stage_payload: dict) -> Optional[Stage]:
    stage_identifier = stage_payload.get("id") or stage_payload.get("stageId") or stage_payload.get("code")
    if not stage_identifier:
        return None

    stage = Stage.query.filter_by(code=stage_identifier).first()
    display_name = stage_payload.get("name") or stage_payload.get("stageName")
    total_levels = _parse_int(stage_payload.get("totalLevels"))

    if stage:
        if display_name and not stage.display_name:
            stage.display_name = display_name
        if total_levels is not None and (stage.total_levels or 0) < total_levels:
            stage.total_levels = total_levels
        return stage

    stage = Stage(code=stage_identifier, display_name=display_name, total_levels=total_levels)
    db.session.add(stage)
    return stage


@app.route("/players", methods=["GET"])
def list_players():
    players = Player.query.order_by(Player.username.asc()).all()
    return jsonify([player.to_dict() for player in players])


@app.route("/players", methods=["POST"])
def create_player():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()

    if not username:
        return jsonify({"error": "Username is required"}), 400

    if Player.query.filter_by(username=username).first():
        return jsonify({"error": "Username is already taken"}), 409

    player = Player(username=username)
    db.session.add(player)
    db.session.commit()

    return jsonify(player.to_dict()), 201


@app.route("/players/availability", methods=["GET"])
def check_username_availability():
    username = (request.args.get("username") or "").strip()
    if not username:
        return jsonify({"error": "Username query parameter is required"}), 400

    is_taken = Player.query.filter_by(username=username).first() is not None
    return jsonify({"username": username, "available": not is_taken})


@app.route("/players/<string:username>", methods=["GET"])
def get_player_details(username: str):
    player = Player.query.filter_by(username=username).first()
    if not player:
        return jsonify({"error": "Player not found"}), 404

    return jsonify(player.to_dict(include_scores=True))


@app.route("/scores/stage", methods=["POST"])
def submit_stage_score():
    payload = request.get_json(silent=True) or {}

    username = (payload.get("username") or "").strip()
    if not username:
        return jsonify({"error": "Username is required"}), 400

    player = _get_player(username)
    if not player:
        return jsonify({"error": "Player not found"}), 404

    stage_payload = payload.get("stage") or {}
    stage = _get_or_create_stage(stage_payload)
    if not stage:
        return jsonify({"error": "Stage identifier is required"}), 400

    total_score = _parse_float(payload.get("totalScore"))
    if total_score is None:
        return jsonify({"error": "totalScore must be a number"}), 400

    total_time = _parse_float(payload.get("totalTime"))
    total_distance = _parse_float(payload.get("totalDistance"))

    levels_payload = payload.get("levels") or []
    completed_levels = _parse_int(payload.get("completedLevels")) or len(levels_payload)
    is_complete = payload.get("isComplete")
    if is_complete is None:
        expected_levels = stage.total_levels
        is_complete = bool(expected_levels and completed_levels >= expected_levels) or (
            bool(levels_payload) and expected_levels is None
        )

    stage_score = StageScore(
        player=player,
        stage=stage,
        total_score=total_score,
        total_time=total_time,
        total_distance=total_distance,
        completed_levels=completed_levels,
        is_complete=is_complete,
    )
    db.session.add(stage_score)

    for index, level_payload in enumerate(levels_payload, start=1):
        level_identifier = level_payload.get("id") or level_payload.get("levelId") or level_payload.get("code")
        if not level_identifier:
            continue

        level_score = LevelScore(
            stage_score=stage_score,
            level_code=str(level_identifier),
            level_name=level_payload.get("name") or level_payload.get("levelName"),
            order_index=_parse_int(level_payload.get("order")) or index,
            score=_parse_float(level_payload.get("score")),
            time_taken=_parse_float(level_payload.get("time")),
            distance=_parse_float(level_payload.get("distance")),
        )
        db.session.add(level_score)

    db.session.commit()

    return jsonify(stage_score.to_dict(include_levels=True)), 201


@app.route("/scores/stages", methods=["GET"])
def list_stage_scoreboards():
    stages = Stage.query.order_by(Stage.code.asc()).all()
    return jsonify([stage.to_dict(include_scores=True) for stage in stages])


@app.route("/scores/stages/<string:stage_code>", methods=["GET"])
def get_stage_scoreboard(stage_code: str):
    stage = Stage.query.filter_by(code=stage_code).first()
    if not stage:
        return jsonify({"error": "Stage not found"}), 404

    stage_scores = (
        StageScore.query
        .filter(StageScore.stage_id == stage.id, StageScore.is_complete.is_(True))
        .order_by(StageScore.total_score.desc(), func.coalesce(StageScore.total_time, 1e9))
        .limit(STAGE_SCORE_LIMIT)
        .all()
    )

    response = {
        "stage": stage.to_dict(),
        "scores": [score.to_dict(include_levels=True) for score in stage_scores],
    }
    return jsonify(response)


@app.route("/scores/levels/<string:stage_code>/<string:level_code>", methods=["GET"])
def get_level_scoreboard(stage_code: str, level_code: str):
    results = (
        db.session.query(LevelScore, StageScore, Player, Stage)
        .join(LevelScore.stage_score)
        .join(StageScore.player)
        .join(StageScore.stage)
        .filter(Stage.code == stage_code, LevelScore.level_code == level_code, StageScore.is_complete.is_(True))
        .order_by(
            func.coalesce(LevelScore.score, -1).desc(),
            func.coalesce(LevelScore.time_taken, 1e9),
        )
        .all()
    )

    seen_players = set()
    scoreboard = []
    for level_score, stage_score, player, stage in results:
        if player.id in seen_players:
            continue
        seen_players.add(player.id)
        scoreboard.append(
            {
                "stage": stage.to_dict(),
                "username": player.username,
                "level": level_score.to_dict(),
                "stageScore": stage_score.to_dict(include_levels=False),
            }
        )

    if not scoreboard:
        return jsonify({"stageId": stage_code, "levelId": level_code, "scores": []})

    return jsonify({"stageId": stage_code, "levelId": level_code, "scores": scoreboard})


@app.route("/scores/overall", methods=["GET"])
def get_overall_scoreboard():
    aggregates = (
        db.session.query(
            Player.id.label("player_id"),
            Player.username.label("username"),
            func.coalesce(func.sum(StageScore.total_score), 0).label("overall_score"),
            func.coalesce(func.sum(func.coalesce(StageScore.total_time, 0)), 0).label("overall_time"),
            func.coalesce(func.sum(func.coalesce(StageScore.total_distance, 0)), 0).label("overall_distance"),
            func.count(func.nullif(StageScore.is_complete, False)).label("stages_completed"),
            func.max(StageScore.created_at).label("last_played_at"),
        )
        .outerjoin(Player.stage_scores)
        .group_by(Player.id)
        .order_by(
            func.coalesce(func.sum(StageScore.total_score), 0).desc(),
            func.coalesce(func.sum(func.coalesce(StageScore.total_time, 0)), 1e9),
        )
        .all()
    )

    response = []
    for entry in aggregates:
        response.append(
            {
                "username": entry.username,
                "overallScore": float(entry.overall_score or 0),
                "overallTime": float(entry.overall_time or 0),
                "overallDistance": float(entry.overall_distance or 0),
                "stagesCompleted": int(entry.stages_completed or 0),
                "lastPlayedAt": entry.last_played_at.isoformat() if entry.last_played_at else None,
            }
        )

    return jsonify(response)


@app.route("/scores/players/<string:username>", methods=["GET"])
def get_player_scores(username: str):
    player = Player.query.filter_by(username=username).first()
    if not player:
        return jsonify({"error": "Player not found"}), 404

    completed_scores = (
        StageScore.query
        .filter(StageScore.player_id == player.id, StageScore.is_complete.is_(True))
        .order_by(StageScore.created_at.desc())
        .all()
    )

    return jsonify(
        {
            "player": player.to_dict(),
            "scores": [score.to_dict(include_levels=True) for score in completed_scores],
        }
    )


# Existing content endpoints remain below.

def load_round_level_data(round_num, level_num, file_type):
    """Load data from specific round/level folder"""
    file_path = f"rounds/round_{round_num}/level_{level_num}/{file_type}.json"
    try:
        with open(file_path) as f:
            return json.load(f)
    except FileNotFoundError:
        return None


def load_metadata(round_num, level_num):
    """Load metadata from specific round/level"""
    return load_round_level_data(round_num, level_num, "metadata")


def load_nodes(round_num, level_num):
    """Load nodes from specific round/level"""
    return load_round_level_data(round_num, level_num, "nodes")


def load_links(round_num, level_num):
    """Load links from specific round/level"""
    return load_round_level_data(round_num, level_num, "links")


def get_round_levels(round_num):
    """Get all level numbers for a specific round"""
    round_path = f"rounds/round_{round_num}"
    if not os.path.exists(round_path):
        return []

    levels = []
    for item in os.listdir(round_path):
        item_path = os.path.join(round_path, item)
        if os.path.isdir(item_path) and item.startswith("level_"):
            try:
                level_num = int(item.split("_")[1])
                levels.append(level_num)
            except (IndexError, ValueError):
                continue

    return sorted(levels)


@app.route("/round<int:round_num>/metadata")
def get_round_metadata(round_num):
    """Get metadata for all levels in a specific round"""
    levels = get_round_levels(round_num)

    if not levels:
        return jsonify({"error": "Round not found or no levels available"}), 404

    all_metadata = []
    for level_num in levels:
        metadata = load_metadata(round_num, level_num)
        if metadata:
            all_metadata.append(metadata)

    return jsonify(all_metadata)


@app.route("/round<int:round_num>/level<int:level_num>/metadata")
def get_level_metadata(round_num, level_num):
    """Get metadata for a specific round and level"""
    metadata = load_metadata(round_num, level_num)
    if metadata:
        return jsonify(metadata)
    return jsonify({"error": "Metadata not found"}), 404


@app.route("/round<int:round_num>/level<int:level_num>/nodes/<node_id>")
def get_level_node(round_num, level_num, node_id):
    """Get a specific node for a round/level"""
    nodes = load_nodes(round_num, level_num)
    links_data = load_links(round_num, level_num)

    if not nodes or not links_data:
        return jsonify({"error": "Level data not found"}), 404

    node_data = next((node for node in nodes if str(node["id"]) == str(node_id)), None)
    if not node_data:
        return jsonify({"error": "Node not found"}), 404

    node_links = links_data.get(str(node_id), [])

    links = []
    for linked_node_id in node_links:
        linked_node = next((node for node in nodes if str(node["id"]) == str(linked_node_id)), None)
        if linked_node:
            links.append(
                {
                    "nodeId": str(linked_node_id),
                    "gps": linked_node["gps"],
                }
            )

    response_node = {
        "id": str(node_data["id"]),
        "panorama": IMAGE_ENDPOINT + str(node_data["panorama"]),
        "links": links,
        "gps": node_data["gps"],
        "sphereCorrection": {"pan": str(node_data["sphereCorrection"]["pan"]) + "deg"},
    }

    return jsonify(response_node)


@app.route("/round<int:round_num>/level<int:level_num>/nodes")
def get_level_nodes(round_num, level_num):
    """Get all nodes for a specific round/level"""
    nodes = load_nodes(round_num, level_num)
    links_data = load_links(round_num, level_num)

    if not nodes or not links_data:
        return jsonify({"error": "Level data not found"}), 404

    response_nodes = []
    for node_data in nodes:
        node_id = str(node_data["id"])

        node_links = links_data.get(node_id, [])

        links = []
        for linked_node_id in node_links:
            linked_node = next((node for node in nodes if str(node["id"]) == str(linked_node_id)), None)
            if linked_node:
                links.append(
                    {
                        "nodeId": str(linked_node_id),
                        "gps": linked_node["gps"],
                    }
                )

        response_node = {
            "id": node_id,
            "panorama": IMAGE_ENDPOINT + str(node_data["panorama"]),
            "links": links,
            "gps": node_data["gps"],
            "panoData": {"poseHeading": (node_data["sphereCorrection"]["pan"]) / 180 * 3.14},
        }
        response_nodes.append(response_node)

    return jsonify(response_nodes)


@app.route("/images/<path:filename>")
def get_image(filename):
    """Serve images from the images directory"""
    return send_from_directory("images", filename)


@app.route("/thumbnails/<path:filename>")
def get_thumbnail(filename):
    """Serve thumbnail images from the thumbnails directory"""
    return send_from_directory("thumbnails", filename)


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)
