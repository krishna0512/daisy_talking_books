from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.shortcuts import render, render_to_response
from django.core.exceptions import ObjectDoesNotExist
from django.template.context_processors import csrf
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponseRedirect
from django.views.generic import CreateView
from django import forms as django_forms
from django.conf import settings
from .models import Book, Upload
import zipfile, os, random
from . import forms
import json

#specific for python3.x
import requests

def replace_space_with_underscore(string):
    return '_'.join(string.split(' '))

def random_alpha_numeric_generator():
    return ''.join(random.choice('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') for i in range(8))

def add_book(request):
    if request.method == 'POST':
        print("This is a post request. ")
        form = forms.AddBookForm(request.POST, request.FILES)
        if form.is_valid():
            print("The file is valid. Saving the book to DB. ")
            zip_ = form.cleaned_data['zip_file']
            lang = form.cleaned_data['language']
            title = replace_space_with_underscore(form.cleaned_data['title'])
            audio = form.cleaned_data['is_audio_required']

            # save book
            book = Book()
            book.zip_file = zip_
            book.title = title
            book.language = lang
            book.is_audio_required = audio
            book.save()
            print("The book has been saved to DB. ")

            # save to upload
            all_files = []
            # import pdb;pdb.set_trace()
            unzip_path = os.path.join(settings.MEDIA_ROOT, settings.IMAGES_UPLOADED,
                                      str(book.id) + '_' + book.title)
            with zipfile.ZipFile(zip_, 'r') as zip_obj:
                zip_obj.extractall(unzip_path)
            print("Files extracted to '{}'".format(unzip_path))

            # for each of the file, save to the db using upload instance
            for dirs, subdirs, files in os.walk(unzip_path):
                if files != [] or files != None:
                    print("DIRS: ", dirs)
                    files_ = [os.path.join(dirs.split(settings.P_VERSION)[-1], f) for f in files]
                    print("FILES: ", files)
                    all_files.extend(files_)

            all_files = [i for i in all_files]
            # page_number = 1
            # import pdb;pdb.set_trace()
            
            txt_files = filter(lambda x: x[-4:] == '.txt', all_files) 
            jpg_files = filter(lambda x: x[-4:] == '.jpg', all_files) 
            # import pdb;pdb.set_trace()
            # print(jpg_files)
            for f in jpg_files:
                page_number = int(f.split("/")[-1].split(".")[1].split("_")[-1])
                print("===<<<<",f)
                upload = Upload()
                upload.book = book
                upload.image = f
                upload.language = lang
                upload.title = title
                upload.page_number = page_number
                txt_files = filter(lambda x: x[-4:] == '.txt', all_files)
                for t in txt_files:
                    with open("./"+t,'r') as fd:
                        t_all_lines=fd.readlines()
                        data="\n".join(t_all_line.rstrip() for t_all_line in t_all_lines)
                    # import pdb;pdb.set_trace()
                    page_number_txt = int(t.split("/")[-1].split(".")[1].split("_")[-1])
                    print("====>>>>",f,t,page_number,page_number_txt)
                    if page_number_txt == page_number:
                        upload.ocr_output = data
                # page_number += 1
                #generate raw OCR before save
                ########################################
#                session = requests.Session()
#                session.trust_env = False
#                data = {"input_image":f,"language":lang.pk,"output_path":"/home/vandna/data/tts_out/"}
#                r = session.post("http://127.0.0.1:5000/get_ocr_output"\
#                    ,data = data)
#                print("Response: ", r.content.decode())
#                j = json.loads(r.text)
#                upload.ocr_output = j["ocr_text"]
                ########################################

                upload.save()
            print("All images in '{}' have been saved".format(book))
            return HttpResponseRedirect("/user_home")
    else:
        print("THe request is not valid. Expected a POST request. ")
        form = forms.AddBookForm()
    context = {'form': form}
    context.update(csrf(request))

    return render(request, 'add_book.html', context)

def get_page_number(book_name):
    page_number = Upload.objects.filter(book__title__exact=book_name).count() + 1
    return page_number

class AddPage(CreateView):
    form_class = forms.AddPageForm
    success_url = reverse_lazy("upload:add_page")
    template_name = "add_page.html"

    def form_valid(self, form):
        form.instance.page_number = get_page_number(form.instance.book)
        return super().form_valid(form)

def single_page_book_id():   
    try:
        id = Book.objects.filter(title__exact="Demo").values('id')[0]['id']
    except Exception:
        id = -1
    return id

class AddSinglePageBook(CreateView):
    form_class = forms.SinglePageBookForm
    success_url = reverse_lazy("single_page", args=[single_page_book_id() or -1])
    template_name = "add_single_page.html"

    def form_valid(self, form):
        form.instance.page_number = 1
        return super().form_valid(form)

"""
def get_book_id(book_name):
    return Book.objects.filter(book__title__exact=book_name).values('id')

def get_percentage_of_pages_in_a_book_processed(book_name):
    processed_books_count = len([elem.get('id') for elem in Upload.objects.filter(book__title__exact=book_name, processed__exact=True).values('id')])
    total_page_count = Upload.objects.filter(book__title__exact=book_name).count()
    return int(processed_books_count * 100 / total_page_count)
"""
