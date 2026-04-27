from django.contrib import admin

from .models import Taman, TamanImage


@admin.register(Taman)
class TamanAdmin(admin.ModelAdmin):
	list_display = ('id', 'nama', 'daerah', 'jenis', 'pbt', 'updated_at')
	search_fields = ('nama', 'lokasi', 'daerah', 'pbt')
	list_filter = ('daerah', 'jenis', 'tandas', 'playground', 'parking', 'surau')


@admin.register(TamanImage)
class TamanImageAdmin(admin.ModelAdmin):
	list_display = ('id', 'taman', 'is_main_cover', 'uploaded_at')
	list_filter = ('taman', 'is_main_cover')
	search_fields = ('taman__nama', 'caption')
