# backend/views.py

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Video, Coordinates
from .utils import parse_coordinates

import json
import cv2
import os

# UPLOAD VIDEO + COORDINATES

@csrf_exempt
@require_POST
def upload_video(request):
    video_file = request.FILES.get("video")
    txt_file = request.FILES.get("coordinates")

    if not video_file or not txt_file:
        return JsonResponse(
            {"success": False, "error": "Missing video or coordinates file."},
            status=400,
        )

    video = Video.objects.create(
        file=video_file,
        fileName=video_file.name,
    )


    cap = cv2.VideoCapture(video.file.path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()

    video.fps = fps
    video.save()

  
    coords = parse_coordinates(txt_file)
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

    fps = video.fps if video.fps and video.fps > 0 else 25.0

    coords_qs = Coordinates.objects.filter(video=video).order_by("frame_id")
    coords = [
        {"frame_id": c.frame_id, "x": c.x, "y": c.y}
        for c in coords_qs
    ]

    return JsonResponse({
        "success": True,
        "video_id": video.id,
        "video_url": video.file.url,  
        "fps": fps,
        "coordinates": coords,
    })


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
