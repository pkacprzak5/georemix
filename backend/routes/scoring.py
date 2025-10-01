from flask import jsonify, request
from sqlalchemy import func
from models.database import db, Player, RoundScore


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

        round_score = RoundScore()  # type: ignore
        round_score.player = player
        round_score.round_number = round_number
        round_score.score = score_value
        round_score.time = time_value
        round_score.min_distance = min_distance_value

        db.session.add(round_score)
        db.session.commit()

        return jsonify(round_score.to_dict()), 201

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

    @app.route("/scores/overall", methods=["GET"])
    def get_overall_scoreboard():
        """Get overall scoreboard across all players"""
        aggregates = (
            db.session.query(
                Player.id.label("player_id"),
                Player.username.label("username"),
                func.coalesce(func.sum(RoundScore.score), 0).label("overall_score"),
                func.coalesce(func.sum(func.coalesce(RoundScore.time, 0)), 0).label(
                    "overall_time"
                ),
                func.coalesce(
                    func.min(func.coalesce(RoundScore.min_distance, 1e9)), 0
                ).label("min_distance"),
                func.count(RoundScore.id).label("rounds_completed"),
                func.max(RoundScore.created_at).label("last_played_at"),
            )
            .outerjoin(RoundScore, Player.id == RoundScore.player_id)
            .group_by(Player.id)
            .order_by(
                func.coalesce(func.sum(RoundScore.score), 0).desc(),
                func.coalesce(func.sum(func.coalesce(RoundScore.time, 0)), 1e9),
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
                    "minDistance": float(entry.min_distance or 0),
                    "roundsCompleted": int(entry.rounds_completed or 0),
                    "lastPlayedAt": (
                        entry.last_played_at.isoformat()
                        if entry.last_played_at
                        else None
                    ),
                }
            )

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
