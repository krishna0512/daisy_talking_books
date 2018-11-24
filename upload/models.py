from django.core.validators import RegexValidator
from django.utils import timezone
from django.conf import settings
from django.db import models
import os, random, time, datetime

"""
TODO's:
- file validations
- functions for file handling
"""

def replace_space_with_underscore(string):
    return '_'.join(string.split(' '))

def random_alpha_numeric_generator():
    return ''.join(random.choice('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') for i in range(8))

def get_current_timestamp():
    return datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d_%H%M%S')

class Language(models.Model):
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=20, default='English')
    postprocessing_enabled = models.BooleanField(default=False)
    dict_file = models.CharField(max_length=255, blank=True)
    vocab_file = models.CharField(max_length=255, blank=True)
    editors = models.ManyToManyField('auth.User', related_name='languages')

    class Meta:
        ordering = ['code']

    def __str__(self):
        return self.name

class BookTag(models.Model):
    tag = models.CharField(max_length=20)

    class Meta:
        verbose_name = 'Book Tag'

    def __str__(self):
        return self.tag

def get_zip_upload_path(instance, filename):

    print("Zip file uploaded to: `{}`".format(os.path.join('compressed_input', str(instance.language.id),
                        str(get_current_timestamp()) + '_' + replace_space_with_underscore(instance.title),
                        filename)))
    return os.path.join('compressed_input', str(instance.language.id),
                        str(get_current_timestamp()) + '_' + replace_space_with_underscore(instance.title),
                        filename)

def validate_file_field(value):
    pass

class Book(models.Model):
    code = models.CharField(max_length=20, default='')
    title = models.CharField(max_length=255, default='')
    author = models.CharField(max_length=255, blank=True)
    zip_file = models.FileField(upload_to=get_zip_upload_path, blank=True, max_length=500, validators=[validate_file_field])
    language = models.ForeignKey(Language, default=1)
    year = models.CharField(max_length=4, blank=True,
                            validators=[RegexValidator(regex=r'^\d{4}$',
                            message='Enter 4 digit year.')])
    tags = models.ManyToManyField(BookTag, blank=True)
    details = models.CharField('Additional Info', max_length=2048, blank=True,
                                null=True)
    created = models.DateTimeField(default=timezone.now)
    modified = models.DateTimeField(default=timezone.now)
    is_audio_required = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    daisy_xml = models.TextField(blank=True)

    class Meta:
        ordering = ['-created']

    def get_display_name(self):
        return ' '.join(self.title.split("_"))

    def __str__(self):
        return '%s' % (self.title)

class AudioBook(models.Model):
    username = models.ForeignKey('auth.User', null=True) #userid
    download_url = models.CharField(max_length=100) #generate path based on op dir + bookname_bookid + filename.mp3
    book = models.ForeignKey(Book) #bookid
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created']

    def split(self):
        return [x.strip() for x in self.download_url.split(',')]

    def __str__(self):
        return '%s' % (self.book.__str__())

def get_image_upload_path(instance, filename):
    print(os.path.join('uploaded_images', str(instance.language.name),
                        str(instance.book.id) or
                        random_alpha_numeric_generator() + '_uncatalogued',
                        filename))
    return os.path.join('uploaded_images', str(instance.language.name),
                        str(instance.book.id) or
                        random_alpha_numeric_generator() + '_uncatalogued',
                        filename)

class Upload(models.Model):
    """ Uploaded Images """
    STATUS_CHOICES = (
        ('', ''),
        ('new', 'New'),
        ('segmented', 'Segmented'),
        ('queued', 'Queued for manual fix'),
        ('fixed', 'Manually fixed'),
        ('processed', 'Processed (OCR + PP)'),
        ('corrected', 'Corrected'),
        ('unusable', 'Unusable')
    )
    image = models.FileField(upload_to=get_image_upload_path)
    xmldata = models.TextField(blank=True)
    ocr_output = models.TextField(blank=True)
    language = models.ForeignKey(Language, default=1)
    book = models.ForeignKey(Book, default=1)
    page_number = models.PositiveSmallIntegerField(null=True)
    created = models.DateTimeField(default=timezone.now)
    modified = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='new')
    processed = models.BooleanField(default=False)

    def __str__(self):
        return str(os.path.split(self.image.name)[-1].split('_', 1)[-1])

def get_segmentation_fixed_image_path(instance, filename):
    return os.path.join(os.path.dirname(instance.image.image.name),
                        os.path.basename(instance.image.image.name)
                        + '.fixed' + os.path.splitext(filename)[1])

def get_segmentation_plot_file_path(instance, filename):
    return os.path.join(os.path.dirname(instance.image.image.name),
                        os.path.basename(instance.image.image.name)
                        + '.segmentation_plot_file'
                        + os.path.splitext(filename)[1])

def get_segmentation_plot_image_path(instance, filename):
    return os.path.join(os.path.dirname(instance.image.image.name),
                        os.path.basename(instance.image.image.name)
                        + '.segmentation_plot_image'
                        + os.path.splitext(filename)[1])

class SegmentationResult(models.Model):
    image = models.OneToOneField(Upload)
    manually_fixed = models.BooleanField(default=False)
    fixed_image = models.ImageField(upload_to=get_segmentation_fixed_image_path,
                                    null=True)
    segmentation_plot_file = models.FileField(
        upload_to=get_segmentation_plot_file_path, null=True)
    segmentation_plot_image = models.ImageField(
        upload_to=get_segmentation_plot_image_path, null=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

def get_segmentation_plot_image_path_1(instance, filename):
    return os.path.join(os.path.dirname(instance.image.image.name), filename)

class OCRResult(models.Model):
    """
    Might be using for one page.
    """
    image = models.OneToOneField(Upload)
    result = models.TextField(verbose_name='Recognized Text', blank=True)
    start_time = models.DateTimeField()
    finish_time = models.DateTimeField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    corrected = models.BooleanField(default=False)
    check_out = models.BooleanField(default=False)
    check_out_by = models.ForeignKey('auth.User', null=True)
    check_out_time = models.DateTimeField(null=True)

    class Meta:
        verbose_name = 'OCR Result'

    def __str__(self):
        return self.image.__str__()

class ErrorWord(models.Model):
    ocr_result = models.ForeignKey(OCRResult)
    word = models.CharField(max_length=255)
    corrected = models.CharField(max_length=255)
    suggestion_number = models.PositiveSmallIntegerField(null=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Error Word'

    def __str__(self):
        return self.word.strip()

class ErrorWordSuggestion(models.Model):
    error_word = models.ForeignKey(ErrorWord)
    suggestion = models.CharField(max_length=255)
    suggestion_number = models.PositiveSmallIntegerField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Error Word Suggestion'

    def __str__(self):
        return self.suggestion.strip()


class CorrectedResult(models.Model):
    ocr_result = models.OneToOneField(OCRResult)
    result = models.TextField(verbose_name='Corrected Text', blank=True)
    editor = models.ForeignKey('auth.User')
    check_out_time = models.DateTimeField()
    check_in_time = models.DateTimeField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Corrected Result'

    def __str__(self):
        return self.ocr_result.__str__()


class Accuracy(models.Model):
    corrected_result = models.OneToOneField(CorrectedResult)
    word_accuracy = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
