import csv

from django.db.models import Count, Q, Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from .forms import TamanForm
from .models import Taman


SENARAI_DAERAH = [
	'Johor Bahru', 'Kluang', 'Batu Pahat', 'Muar', 'Kulai',
	'Kota Tinggi', 'Segamat', 'Pontian', 'Mersing', 'Tangkak',
]

JENIS_TAMAN = [
	'Taman Tempatan', 'Taman Bandaran', 'Lot Permainan',
	'Padang Permainan', 'Taman Kejiranan', 'Taman Permainan',
]


def seed_data_if_empty():
	if Taman.objects.exists():
		return

	items = [
		{
			'nama': 'Taman Merdeka', 'lokasi': 'Jalan Kolam Ayer', 'daerah': 'Johor Bahru',
			'keluasan': 30, 'jenis': 'Taman Tempatan', 'pbt': 'MBJB',
			'tandas': True, 'playground': True, 'parking': True, 'surau': True,
			'deskripsi': 'Taman Merdeka merupakan sebuah taman awam yang luas dan mendamaikan di tengah bandaraya Johor Bahru.'
		},
		{
			'nama': 'Taman Rekreasi Gunung Lambak', 'lokasi': 'Kluang', 'daerah': 'Kluang',
			'keluasan': 50, 'jenis': 'Taman Rekreasi', 'pbt': 'Rizab Hutan',
			'tandas': True, 'playground': False, 'parking': True, 'surau': True,
			'deskripsi': 'Destinasi popular bagi pendaki dan pencinta alam di Kluang.'
		},
		{
			'nama': 'Taman Botani Batu Pahat', 'lokasi': 'Jalan Minyak Beku', 'daerah': 'Batu Pahat',
			'keluasan': 15, 'jenis': 'Taman Botani', 'pbt': 'Majlis Perbandaran',
			'tandas': True, 'playground': True, 'parking': True, 'surau': False,
			'deskripsi': 'Taman Botani ini menyimpan pelbagai spesies flora yang unik.'
		},
	]

	Taman.objects.bulk_create(Taman(**item) for item in items)


def dashboard(request):
	seed_data_if_empty()
	valid_tabs = {'senarai', 'borang', 'laporan', 'profil'}
	active_tab = request.GET.get('tab', 'senarai').strip().lower()
	if active_tab not in valid_tabs:
		active_tab = 'senarai'

	edit_id = request.GET.get('edit', '').strip()
	editing_taman = None
	if active_tab == 'borang' and edit_id.isdigit():
		editing_taman = Taman.objects.filter(id=int(edit_id)).first()

	query = Taman.objects.all()

	search = request.GET.get('search', '').strip()
	daerah = request.GET.get('daerah', '').strip()
	jenis = request.GET.get('jenis', '').strip()

	if search:
		query = query.filter(Q(nama__icontains=search) | Q(lokasi__icontains=search))
	if daerah:
		query = query.filter(daerah=daerah)
	if jenis:
		query = query.filter(jenis=jenis)

	for field in ('tandas', 'playground', 'parking', 'surau'):
		if request.GET.get(field) == '1':
			query = query.filter(**{field: True})

	if request.method == 'POST':
		post_edit_id = request.POST.get('editing_id', '').strip()
		post_instance = None
		if post_edit_id.isdigit():
			post_instance = Taman.objects.filter(id=int(post_edit_id)).first()

		form = TamanForm(request.POST, instance=post_instance)
		if form.is_valid():
			form.save()
			return redirect('/?tab=senarai')
	else:
		form = TamanForm(instance=editing_taman)

	taman_list = query.order_by('nama')
	selected_taman = None
	selected_taman_id = request.GET.get('taman', '').strip()
	if active_tab == 'profil' and selected_taman_id.isdigit():
		selected_taman = Taman.objects.filter(id=int(selected_taman_id)).first()
	by_daerah = Taman.objects.values('daerah').annotate(total=Count('id')).order_by('-total')
	by_jenis = Taman.objects.values('jenis').annotate(total=Count('id')).order_by('-total')
	jumlah_keluasan = Taman.objects.aggregate(total=Sum('keluasan'))['total'] or 0

	context = {
		'taman_list': taman_list,
		'form': form,
		'senarai_daerah': SENARAI_DAERAH,
		'jenis_taman': JENIS_TAMAN,
		'search': search,
		'selected_daerah': daerah,
		'selected_jenis': jenis,
		'jumlah_taman': Taman.objects.count(),
		'jumlah_keluasan': jumlah_keluasan,
		'taburan_daerah': by_daerah,
		'taburan_jenis': by_jenis,
		'filter_tandas': request.GET.get('tandas') == '1',
		'filter_playground': request.GET.get('playground') == '1',
		'filter_parking': request.GET.get('parking') == '1',
		'filter_surau': request.GET.get('surau') == '1',
		'active_tab': active_tab,
		'selected_taman': selected_taman,
		'editing_taman': editing_taman,
	}
	return render(request, 'taman/dashboard.html', context)


def profil_taman(request, pk):
	taman = get_object_or_404(Taman, pk=pk)
	return render(request, 'taman/profil.html', {'taman': taman})


def delete_taman(request, pk):
	taman = get_object_or_404(Taman, pk=pk)
	if request.method == 'POST':
		taman.delete()
	return redirect('/?tab=senarai')


def export_csv(request):
	response = HttpResponse(content_type='text/csv')
	response['Content-Disposition'] = 'attachment; filename="senarai_taman.csv"'

	writer = csv.writer(response)
	writer.writerow([
		'ID', 'Nama Taman', 'Lokasi', 'Daerah', 'Keluasan (Ekar)', 'Jenis',
		'PBT', 'Tandas', 'Playground', 'Parking', 'Surau', 'Deskripsi', 'Image URL'
	])

	for t in Taman.objects.all().order_by('id'):
		writer.writerow([
			t.id, t.nama, t.lokasi, t.daerah, t.keluasan, t.jenis, t.pbt,
			'Ya' if t.tandas else 'Tidak',
			'Ya' if t.playground else 'Tidak',
			'Ya' if t.parking else 'Tidak',
			'Ya' if t.surau else 'Tidak',
			t.deskripsi,
			t.image_url,
		])

	return response
