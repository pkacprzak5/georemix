import math

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate the Haversine distance between two points in meters"""
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lng1_rad = math.radians(lng1)
    lat2_rad = math.radians(lat2)
    lng2_rad = math.radians(lng2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))

    # Radius of Earth in meters
    radius = 6371000

    return radius * c


def is_line_of_sight_blocked(start_loc, end_loc, all_locations, threshold_distance=10):
    """
    Check if there's another location blocking the direct line between start and end locations.
    Returns True if blocked, False if clear line of sight.
    """
    start_lng, start_lat = start_loc["gps"]
    end_lng, end_lat = end_loc["gps"]

    for intermediate_loc in all_locations:
        # Skip if it's the start or end location
        if intermediate_loc["id"] in [start_loc["id"], end_loc["id"]]:
            continue

        int_lng, int_lat = intermediate_loc["gps"]

        # Calculate distance from intermediate point to the line between start and end
        # Using point-to-line distance formula

        # Vector from start to end
        dx = end_lng - start_lng
        dy = end_lat - start_lat

        # Vector from start to intermediate point
        px = int_lng - start_lng
        py = int_lat - start_lat

        # If start and end are the same point, just check distance
        if dx == 0 and dy == 0:
            continue

        # Calculate the parameter t for the closest point on the line
        line_length_squared = dx * dx + dy * dy
        t = max(0, min(1, (px * dx + py * dy) / line_length_squared))

        # Find the closest point on the line segment
        closest_lng = start_lng + t * dx
        closest_lat = start_lat + t * dy

        # Calculate distance from intermediate point to the line
        distance_to_line = calculate_distance(
            int_lat, int_lng, closest_lat, closest_lng
        )

        # Check if the intermediate point is close to the line and between start and end
        if distance_to_line < threshold_distance:
            # Check if intermediate point is actually between start and end (not beyond)
            dist_start_to_intermediate = calculate_distance(
                start_lat, start_lng, int_lat, int_lng
            )
            dist_intermediate_to_end = calculate_distance(
                int_lat, int_lng, end_lat, end_lng
            )
            dist_start_to_end = calculate_distance(
                start_lat, start_lng, end_lat, end_lng
            )

            # If the sum of distances through intermediate is roughly equal to direct distance,
            # then the intermediate point is on the path
            if (
                abs(
                    (dist_start_to_intermediate + dist_intermediate_to_end)
                    - dist_start_to_end
                )
                < threshold_distance
            ):
                return True

    return False


def find_nearest_unblocked_nodes(locations, max_links=4):
    """
    Find the nearest nodes for each location, avoiding links that pass through other nodes.
    """
    location_links = {}

    for current_loc in locations:
        # Calculate distances to all other locations
        distances = []
        for other_loc in locations:
            if current_loc["id"] != other_loc["id"]:
                lng1, lat1 = current_loc["gps"]
                lng2, lat2 = other_loc["gps"]
                dist = calculate_distance(lat1, lng1, lat2, lng2)
                distances.append((other_loc, dist))

        # Sort by distance
        distances.sort(key=lambda x: x[1])

        # Find unblocked links
        links = []
        for other_loc, distance in distances:
            if len(links) >= max_links:
                break

            # Check if line of sight is blocked
            if not is_line_of_sight_blocked(current_loc, other_loc, locations):
                links.append(other_loc["id"])

        location_links[current_loc["id"]] = links

    return location_links


def calculate_bearing(lat1, lng1, lat2, lng2):
    """Calculate bearing from point 1 to point 2 in degrees"""
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlng_rad = math.radians(lng2 - lng1)

    bearing_rad = math.atan2(
        math.sin(dlng_rad) * math.cos(lat2_rad),
        math.cos(lat1_rad) * math.sin(lat2_rad)
        - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(dlng_rad),
    )
    bearing_deg = math.degrees(bearing_rad)
    bearing_deg = (bearing_deg + 360) % 360  # Normalize to 0-360

    return bearing_deg