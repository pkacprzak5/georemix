from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://localhost:5000")
IMAGE_ENDPOINT = f"{BASE_URL}/images/"

app = Flask(__name__)
CORS(app)


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
    import os

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

    # Find the node
    node_data = next((node for node in nodes if str(node["id"]) == str(node_id)), None)
    if not node_data:
        return jsonify({"error": "Node not found"}), 404

    # Get links for this node
    node_links = links_data.get(str(node_id), [])

    # Build links with position information
    links = []
    for linked_node_id in node_links:
        # Find the linked node to get GPS for bearing calculation
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

    # Build the response node
    response_node = {
        "id": str(node_data["id"]),
        "panorama": IMAGE_ENDPOINT + str(node_data["panorama"]),
        "links": links,
        "gps": node_data["gps"],
        "sphereCorrection": {
            "pan": str(node_data["sphereCorrection"]["pan"]) + "deg",
            "tilt": str(node_data["sphereCorrection"]["tilt"]) + "deg",
            "roll": str(node_data["sphereCorrection"]["roll"]) + "deg",
        },
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

        # Get links for this node
        node_links = links_data.get(node_id, [])

        # Build links with position information
        links = []
        for linked_node_id in node_links:
            # Find the linked node to get GPS for bearing calculation
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

        # Build the response node
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
    """Serve images from the images directory"""
    return send_from_directory("images", filename)


@app.route("/thumbnails/<path:filename>")
def get_thumbnail(filename):
    """Serve thumbnail images from the thumbnails directory"""
    return send_from_directory("thumbnails", filename)


if __name__ == "__main__":
    app.run(debug=True)
