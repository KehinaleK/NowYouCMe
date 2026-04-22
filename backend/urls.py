from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/upload/", views.upload_video),
    path("api/video/<int:video_id>/", views.get_video_data),
    path("api/video/<int:video_id>/save/", views.save_coordinates),
    path("api/video/<int:video_id>/frame/<int:frame_index>/", views.get_video_frame),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)