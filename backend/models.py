from django.db import models

class Video(models.Model):

    file = models.FileField(upload_to='videos/')
    fileName = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    fps = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.fileName
    

# class per frame
class Coordinates(models.Model):

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='coordinates')
    frame_id = models.IntegerField()
    x = models.FloatField()
    y = models.FloatField()

    def __str__(self):
        return f'frame {self.frame_id} : {self.x} and {self.y}'
    
    