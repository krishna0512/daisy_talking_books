from django.forms import ModelForm
from .models import Book, Upload

class AddBookForm(ModelForm):
    class Meta:
        model = Book
        fields = ["zip_file", "title", "language", "author", "tags", "is_audio_required"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["is_audio_required"].label = "Is Audio book required"

class AddPageForm(ModelForm):
    class Meta:
        model = Upload
        fields = ["image", "language", "book"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

class SinglePageBookForm(ModelForm):
    class Meta:
        model = Upload
        fields = ["image", "language"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
