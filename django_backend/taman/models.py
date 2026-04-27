from django.db import models


class Taman(models.Model):
	nama = models.CharField(max_length=150)
	lokasi = models.CharField(max_length=255)
	daerah = models.CharField(max_length=80)
	keluasan = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
	jenis = models.CharField(max_length=80)
	pbt = models.CharField(max_length=120, blank=True)

	tandas = models.BooleanField(default=False)
	playground = models.BooleanField(default=False)
	parking = models.BooleanField(default=False)
	surau = models.BooleanField(default=False)

	deskripsi = models.TextField(blank=True)
	image_url = models.URLField(blank=True)
	
	# New field for main cover image
	main_cover_image = models.ForeignKey('TamanImage', null=True, blank=True, on_delete=models.SET_NULL, related_name='cover_for')

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['nama']

	def __str__(self):
		return self.nama


class TamanImage(models.Model):
	taman = models.ForeignKey(Taman, on_delete=models.CASCADE, related_name='images')
	image = models.ImageField(upload_to='taman_images/%Y/%m/%d/')
	caption = models.CharField(max_length=255, blank=True)
	is_main_cover = models.BooleanField(default=False)
	uploaded_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-is_main_cover', '-uploaded_at']

	def __str__(self):
		return f"{self.taman.nama} - {self.id}"
