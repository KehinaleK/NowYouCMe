# backend/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Video, Coordinates
from .utils import parse_coordinates
import cv2

def upload_page(request):
    return render(request, 'upload_test.html')

@csrf_exempt
def upload_video(request):

    video_file = request.FILES.get('video')
    txt_file = request.FILES.get('coordinates')


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
            frame_id=c['frame_id'],
            x=c['x'],
            y=c['y']
        )
    
    return JsonResponse({
        'success': True,
        'video_id': video.id,
        'coords_count': len(coords),
        'coords_complete' : coords,
        'fps' : fps
    })
