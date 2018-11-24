from upload.models import Book, Page
import django_filters

class BookFilter(django_filters.FilterSet):
    class Meta:
        model = Page
        fields = ['book_name', 'text', 'image', ]
