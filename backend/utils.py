import cv2
import numpy as np


def parse_coordinates(file):
    coords = []
    for line in file:
        line = line.decode('utf-8').strip()
        if not line:
            continue
        line = line.strip('[').strip(']').replace("'", "")
        parts = line.split(",")
        if len(parts) < 3:
            continue
        try:
            frame_id = int(float(parts[0].strip()))
            x = float(parts[1].strip())
            y = float(parts[2].strip())
            is_goal = bool(int(float(parts[3].strip()))) if len(parts) >= 4 else False
            coords.append({'frame_id': frame_id, 'x': x, 'y': y, 'is_goal': is_goal})
        except (ValueError, IndexError):
            continue
    return coords


def clean_coordinates(coords):
    """Remove duplicate frame_ids (keep first) and fill missing frames with zeros."""
    seen = {}
    for c in coords:
        fid = c['frame_id']
        if fid not in seen:
            seen[fid] = c

    if not seen:
        return []

    min_frame = min(seen.keys())
    max_frame = max(seen.keys())

    cleaned = []
    for fid in range(min_frame, max_frame + 1):
        if fid in seen:
            cleaned.append(seen[fid])
        else:
            cleaned.append({'frame_id': fid, 'x': 0.0, 'y': 0.0, 'is_goal': False})

    return cleaned
