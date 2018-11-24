from django.conf.urls import url
from . import views

app_name = 'upload'

urlpatterns = [
    url(r"add_book/$", views.add_book, name="add_book"),
    url(r"add_page/$", views.AddPage.as_view(), name="add_page"),
    url(r"add_single_page/$", views.AddSinglePageBook.as_view(), name="add_single_page"),
]
