from django.db import models

class Video(models.Model):
    file = models.FileField(upload_to='videos/')
    fileName = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    numFrames = models.IntegerField(null=True, blank=True)
    fps = models.FloatField(null=True, blank=True)
    duration = models.FloatField(null=True, blank=True)
    frames_timestamps = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.fileName
    

class Coordinates(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='coordinates')
    frame_id = models.IntegerField()
    x = models.FloatField()
    y = models.FloatField()
    is_goal = models.BooleanField(default=False)

    def __str__(self):
        return f'frame {self.frame_id} : {self.x} and {self.y}'