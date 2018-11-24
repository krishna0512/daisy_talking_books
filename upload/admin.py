from django.contrib import admin
from . import models

admin.site.register(models.ErrorWordSuggestion)
admin.site.register(models.SegmentationResult)
admin.site.register(models.CorrectedResult)
admin.site.register(models.OCRResult)
admin.site.register(models.ErrorWord)
admin.site.register(models.AudioBook)
admin.site.register(models.Language)
admin.site.register(models.Accuracy)
admin.site.register(models.BookTag)
admin.site.register(models.Upload)
admin.site.register(models.Book)
