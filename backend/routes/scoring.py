from datetime import datetime
from flask import jsonify, request
from sqlalchemy import func
from models.database import db, Player, RoundScore
from middleware.security import validate_api_key, validate_origin, require_json


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


def _get_player(username: str) -> Player | None:
    return Player.query.filter_by(username=username).first()


def register_score_routes(app):
    @app.route("/players", methods=["GET"])
    def list_players():
        players = Player.query.order_by(Player.username.asc()).all()
        return jsonify([player.to_dict() for player in players])

    @app.route("/players", methods=["POST"])
    @validate_api_key
    @validate_origin
    @require_json
    def create_player():
        payload = request.get_json(silent=True) or {}
        username = (payload.get("username") or "").strip()

        if not username:
            return jsonify({"error": "Username is required"}), 400

        if Player.query.filter_by(username=username).first():
            return jsonify({"error": "Username is already taken"}), 409

        player = Player()  # type: ignore
        player.username = username
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

    @app.route("/scores/round", methods=["POST"])
    @validate_api_key
    @validate_origin
    @require_json
    def submit_round_score():
        payload = request.get_json(silent=True) or {}

        username = (payload.get("username") or "").strip()
        if not username:
            return jsonify({"error": "Username is required"}), 400

        player = _get_player(username)
        if not player:
            return jsonify({"error": "Player not found"}), 404

        round_number = _parse_int(payload.get("roundNumber"))
        if round_number is None:
            return jsonify({"error": "roundNumber is required"}), 400

        score_value = _parse_float(payload.get("score"))
        time_value = _parse_float(payload.get("time"))
        min_distance_value = _parse_float(payload.get("minDistance"))

        # Check if a score already exists for this player and round
        round_score = RoundScore.query.filter_by(
            player_id=player.id, 
            round_number=round_number
        ).first()

        if round_score:
            # Update existing score
            round_score.score = score_value
            round_score.time = time_value
            round_score.min_distance = min_distance_value
            round_score.created_at = datetime.utcnow()
            status_code = 200
        else:
            # Create new score
            round_score = RoundScore()  # type: ignore
            round_score.player = player
            round_score.round_number = round_number
            round_score.score = score_value
            round_score.time = time_value
            round_score.min_distance = min_distance_value
            db.session.add(round_score)
            status_code = 201

        db.session.commit()

        return jsonify(round_score.to_dict()), status_code

    @app.route("/scores/rounds/<int:round_number>", methods=["GET"])
    def get_round_scoreboard(round_number: int):
        """Get scoreboard for a specific round"""
        round_scores = (
            RoundScore.query.filter(RoundScore.round_number == round_number)
            .order_by(
                RoundScore.score.desc(),
                func.coalesce(RoundScore.time, 1e9),
            )
            .all()
        )

        response = {
            "roundNumber": round_number,
            "scores": [score.to_dict() for score in round_scores],
        }
        return jsonify(response)

    @app.route("/scores/players/<string:username>", methods=["GET"])
    def get_player_scores(username: str):
        """Get all scores for a specific player"""
        player = Player.query.filter_by(username=username).first()
        if not player:
            return jsonify({"error": "Player not found"}), 404

        scores = (
            RoundScore.query.filter(RoundScore.player_id == player.id)
            .order_by(RoundScore.created_at.desc())
            .all()
        )

        return jsonify(
            {
                "player": player.to_dict(),
                "scores": [score.to_dict() for score in scores],
            }
        )
