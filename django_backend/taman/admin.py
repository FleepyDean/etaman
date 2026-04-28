from django.contrib import admin
from django.utils.html import format_html

from .models import Taman, TamanImage


@admin.register(Taman)
class TamanAdmin(admin.ModelAdmin):
	list_display = ('id', 'nama', 'cover_image_preview', 'daerah', 'jenis', 'pbt', 'updated_at')
	search_fields = ('nama', 'lokasi', 'daerah', 'pbt')
	list_filter = ('daerah', 'jenis', 'tandas', 'playground', 'parking', 'surau')
	
	def cover_image_preview(self, obj):
		if obj.main_cover_image and obj.main_cover_image.image:
			return format_html(
				'<img src="{}" width="100" height="100" style="object-fit: cover; border-radius: 4px;" />',
				obj.main_cover_image.image.url
			)
		return "No image"
	cover_image_preview.short_description = "Cover"


@admin.register(TamanImage)
class TamanImageAdmin(admin.ModelAdmin):
	list_display = ('id', 'taman', 'image_preview', 'is_main_cover', 'uploaded_at')
	list_filter = ('taman', 'is_main_cover')
	search_fields = ('taman__nama', 'caption')
	readonly_fields = ('image_preview',)
	
	def image_preview(self, obj):
		if obj.image:
			return format_html(
				'<img src="{}" width="150" height="150" style="object-fit: cover; border-radius: 4px;" />',
				obj.image.url
			)
		return "No image"
	image_preview.short_description = "Preview"
