# backend/views.py

from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Video, Coordinates
from .utils import parse_coordinates

import json
import cv2
import os


# UPLOAD VIDEO + COORDINATES

def get_frames_timestamps(duration, num_frames):
    if num_frames <= 0:
        return []
    frame_duration = duration / num_frames
    return [i * frame_duration for i in range(num_frames)]


@csrf_exempt
@require_POST
def upload_video(request):
    video_file = request.FILES.get("video")
    txt_file = request.FILES.get("coordinates")

    if not video_file:
        return JsonResponse(
            {"success": False, "error": "Missing video file."},
            status=400,
        )

    video = Video.objects.create(
        file=video_file,
        fileName=video_file.name,
    )

    cap = cv2.VideoCapture(video.file.path)

    fps = cap.get(cv2.CAP_PROP_FPS) or 0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = frame_count / fps if fps > 0 else 0
    cap.release()

    step = 10
    num_samples = frame_count // step if frame_count >= step else max(frame_count, 1)
    frames_timestamps = [(i * step / fps) for i in range(num_samples)] if fps > 0 else []

    if txt_file:
        txt_coords = parse_coordinates(txt_file)
    else:
        txt_coords = []

    coords = []
    for i in range(len(frames_timestamps)):
        if i < len(txt_coords):
            coords.append({"frame_id": i, "x": txt_coords[i]["x"], "y": txt_coords[i]["y"]})
        else:
            coords.append({"frame_id": i, "x": 0, "y": 0})

    video.fps = fps
    video.duration = duration
    video.numFrames = len(coords)
    video.frames_timestamps = frames_timestamps
    video.save()

    for c in coords:
        Coordinates.objects.create(
            video=video,
            frame_id=c["frame_id"],
            x=c["x"],
            y=c["y"],
        )

    return JsonResponse({
        "success": True,
        "video_id": video.id,
    })


# GET VIDEO DATA 

@require_GET
def get_video_data(request, video_id: int):
    video = get_object_or_404(Video, id=video_id)

    coords_qs = Coordinates.objects.filter(video=video).order_by("frame_id")
    coords = [
        {"frame_id": c.frame_id, "x": c.x, "y": c.y}
        for c in coords_qs
    ]

    frame_timestamps = video.frames_timestamps or []

    frame_preview_urls = [
        f"/api/video/{video.id}/frame/{i}/"
        for i in range(len(frame_timestamps))
    ]

    return JsonResponse({
        "success": True,
        "video_id": video.id,
        "video_url": video.file.url,
        "coordinates": coords,
        "frame_timestamps": frame_timestamps,
        "frame_preview_urls": frame_preview_urls,
        "duration": video.duration,
    })


# GET ONE FRAME IMAGE FOR A CUSTOM FRAME INDEX

@require_GET
def get_video_frame(request, video_id: int, frame_index: int):
    video = get_object_or_404(Video, id=video_id)

    frame_timestamps = video.frames_timestamps

    if frame_index < 0 or frame_index >= len(frame_timestamps):
        return JsonResponse(
            {"success": False, "error": "Invalid frame index"},
            status=400,
        )

    timestamp = frame_timestamps[frame_index]

    cap = cv2.VideoCapture(video.file.path)
    cap.set(cv2.CAP_PROP_POS_MSEC, timestamp * 1000)

    success, frame = cap.read()
    cap.release()

    if not success or frame is None:
        return JsonResponse(
            {"success": False, "error": "Could not extract frame"},
            status=500,
        )

    ok, buffer = cv2.imencode(".jpg", frame)
    if not ok:
        return JsonResponse(
            {"success": False, "error": "Could not encode frame"},
            status=500,
        )

    return HttpResponse(buffer.tobytes(), content_type="image/jpeg")


# SAVE CORRECTED COORDINATES

@csrf_exempt
@require_POST
def save_coordinates(request, video_id: int):
    video = get_object_or_404(Video, id=video_id)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "error": "Invalid JSON body"},
            status=400,
        )

    coordinates = data.get("coordinates", [])

    output_path = os.path.join(
        "media",
        f"{video_id}_coordinates_corrected.json"
    )

    with open(output_path, "w") as f:
        json.dump(coordinates, f, indent=2)

    return JsonResponse({
        "success": True,
        "file": output_path,
    })