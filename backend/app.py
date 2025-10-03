import json
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory, make_response
from flask_cors import CORS
from models.database import db
from routes.scoring import register_score_routes

if not load_dotenv():
    print(".env file not detected.")

PORT = int(os.getenv("API_PORT", "5000"))
HOST = os.getenv("API_HOST", "http://localhost")
BASE_URL = f"{HOST}:{PORT}"
IMAGE_ENDPOINT = f"{BASE_URL}/images/"

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///scores.db")
CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost,http://localhost:5173"
).split(",")

cors = CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)


db.init_app(app)
register_score_routes(app)


# Content endpoints below

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
        linked_node = next(
            (node for node in nodes if str(node["id"]) == str(linked_node_id)), None
        )
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
            linked_node = next(
                (node for node in nodes if str(node["id"]) == str(linked_node_id)), None
            )
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
            "panoData": {
                "poseHeading": (node_data["sphereCorrection"]["pan"]) / 180 * 3.14
            },
        }
        response_nodes.append(response_node)

    return jsonify(response_nodes)


@app.route("/images/<path:filename>")
def get_image(filename):
    """Serve images from the images directory and ensure CORS headers are present."""
    response = make_response(send_from_directory("images", filename))
    # If ALLOWED_ORIGINS contains a wildcard, allow all; otherwise join allowed origins
    if "*" in ALLOWED_ORIGINS:
        response.headers.set("Access-Control-Allow-Origin", "*")
    else:
        # For simplicity, if multiple origins are present, expose the first one.
        response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0])
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response


@app.route("/thumbnails/<path:filename>")
def get_thumbnail(filename):
    """Serve thumbnail images from the thumbnails directory and ensure CORS headers are present."""
    response = make_response(send_from_directory("thumbnails", filename))
    if "*" in ALLOWED_ORIGINS:
        response.headers.set("Access-Control-Allow-Origin", "*")
    else:
        response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0])
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True, port=PORT)
