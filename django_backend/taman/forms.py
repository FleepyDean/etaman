from django import forms

from .models import Taman


class TamanForm(forms.ModelForm):
    class Meta:
        model = Taman
        fields = [
            'nama',
            'lokasi',
            'daerah',
            'keluasan',
            'jenis',
            'pbt',
            'tandas',
            'playground',
            'parking',
            'surau',
            'deskripsi',
            'image_url',
        ]
        widgets = {
            'deskripsi': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, field in self.fields.items():
            if isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs.update({'class': 'form-check-input'})
            else:
                field.widget.attrs.update({'class': 'form-control'})
        self.fields['image_url'].help_text = 'Masukkan URL gambar (contoh: https://...)'
