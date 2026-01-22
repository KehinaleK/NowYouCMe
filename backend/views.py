# backend/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Video, Coordinates
from .utils import parse_coordinates
import json
import cv2

def upload_page(request):
    return render(request, 'upload_test.html')

@csrf_exempt
def upload_video(request):

    video_file = request.FILES.get('video')
    txt_file = request.FILES.get('coordinates')

    if not video_file or not txt_file:
        return JsonResponse({'success': False, 'error': 'Missing video or coordinates file.'}, status=400)


    ## Creating the video instance
    video = Video.objects.create(
        file=video_file,
        fileName=video_file.name,
    )


    cap = cv2.VideoCapture(video.file.path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    # total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    video.fps = fps
    video.save()

    
    ## Then, parsing the coordinates
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
        'video_id': video.id
    })



def viewer_page(request, video_id: int):
    
    video = get_object_or_404(Video, id=video_id)
    # fps peut être null si non calculé → on met une valeur de secours
    fps = video.fps if video.fps and video.fps > 0 else 25.0


    allCoordinates = Coordinates.objects.filter(video=video).order_by('frame_id')

    allCoordinates = [{'frame_id': c.frame_id, 'x': c.x, 'y': c.y} for c in allCoordinates]
    allCoordinatesJSON = json.dumps(allCoordinates)
    

    return render(request, "viewer.html", {
        "video": video,
        "fps": fps,
        "allCoordinates": allCoordinatesJSON
    })