from django.db import models
from django.contrib.auth.models import User


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


class Daerah(models.Model):
    nama = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='Active')  # Active / Inactive
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama']

    def __str__(self):
        return self.nama


class StatusTanah(models.Model):
    nama = models.CharField(max_length=100, unique=True)
    keterangan = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama']

    def __str__(self):
        return self.nama


class Facility(models.Model):
    nama = models.CharField(max_length=100, unique=True)
    kategori = models.CharField(max_length=50, blank=True)  # e.g., Sukan, Infrastruktur
    status = models.CharField(max_length=20, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama']
        verbose_name_plural = "Facilities"

    def __str__(self):
        return self.nama


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    district = models.ForeignKey(Daerah, on_delete=models.SET_NULL, null=True, blank=True)
    role = models.CharField(max_length=20, choices=[
        ('JLNJ_ADMIN', 'JLNJ Administrator'),
        ('PBT_OFFICER', 'PBT Officer'),
    ], default='PBT_OFFICER')
    phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, default='Active')  # Active / Inactive

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=30)  # CREATE, UPDATE, DELETE, LOGIN, etc.
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action_type} by {self.user} at {self.timestamp}"