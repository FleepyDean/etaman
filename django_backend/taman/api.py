import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from .models import Taman, TamanImage


def get_absolute_image_url(request, image_path):
    """Build absolute URL for image"""
    if not image_path:
        return None
    base_url = request.build_absolute_uri('/').rstrip('/')
    return f"{base_url}{image_path}"


def serialize_taman(taman, request=None):
    """Convert Taman instance to dictionary"""
    images = taman.images.all()
    serialized_images = []
    
    for img in images:
        image_url = img.image.url
        if request:
            image_url = get_absolute_image_url(request, image_url)
        serialized_images.append({
            'id': img.id,
            'url': image_url,
            'caption': img.caption,
            'is_main_cover': img.is_main_cover,
        })
    
    return {
        'id': taman.id,
        'nama': taman.nama,
        'lokasi': taman.lokasi,
        'daerah': taman.daerah,
        'keluasan': str(taman.keluasan) if taman.keluasan else None,
        'jenis': taman.jenis,
        'PBT': taman.pbt,
        'latitude': str(taman.latitude) if taman.latitude is not None else None,
        'longitude': str(taman.longitude) if taman.longitude is not None else None,
        'kemudahan': {
            'tandas': taman.tandas,
            'playground': taman.playground,
            'parking': taman.parking,
            'surau': taman.surau,
        },
        'deskripsi': taman.deskripsi,
        'image_url': taman.image_url,
        'images': serialized_images,
        'main_cover_id': taman.main_cover_image.id if taman.main_cover_image else None,
        'created_at': taman.created_at.isoformat(),
        'updated_at': taman.updated_at.isoformat(),
    }


@require_http_methods(["GET"])
def api_list_taman(request):
    """Get all taman with optional filtering"""
    query = Taman.objects.all()
    
    # Filter by search
    search = request.GET.get('search', '').strip()
    if search:
        query = query.filter(nama__icontains=search) | query.filter(lokasi__icontains=search)
    
    # Filter by daerah
    daerah = request.GET.get('daerah', '').strip()
    if daerah:
        query = query.filter(daerah=daerah)
    
    # Filter by jenis
    jenis = request.GET.get('jenis', '').strip()
    if jenis:
        query = query.filter(jenis=jenis)
    
    # Filter by facilities
    for facility in ('tandas', 'playground', 'parking', 'surau'):
        if request.GET.get(facility) == '1':
            query = query.filter(**{facility: True})
    
    taman_list = list(query.order_by('nama').values())
    tamans = [serialize_taman(t, request) for t in query.order_by('nama')]
    
    return JsonResponse({
        'success': True,
        'data': tamans,
        'count': len(tamans)
    })


@require_http_methods(["GET"])
def api_get_taman(request, pk):
    """Get a single taman by ID"""
    try:
        taman = Taman.objects.get(id=pk)
        return JsonResponse({
            'success': True,
            'data': serialize_taman(taman, request)
        })
    except Taman.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Taman tidak ditemukan'
        }, status=404)


@csrf_exempt
@require_http_methods(["POST"])
def api_create_taman(request):
    """Create a new taman"""
    try:
        data = json.loads(request.body)
        
        # Handle both nested kemudahan object and flat facility fields
        kemudahan = data.get('kemudahan', {})
        tandas = kemudahan.get('tandas') if isinstance(kemudahan, dict) else data.get('tandas', False)
        playground = kemudahan.get('playground') if isinstance(kemudahan, dict) else data.get('playground', False)
        parking = kemudahan.get('parking') if isinstance(kemudahan, dict) else data.get('parking', False)
        surau = kemudahan.get('surau') if isinstance(kemudahan, dict) else data.get('surau', False)
        
        taman = Taman.objects.create(
            nama=data.get('nama', ''),
            lokasi=data.get('lokasi', ''),
            daerah=data.get('daerah', ''),
            keluasan=data.get('keluasan') or None,
            jenis=data.get('jenis', ''),
            pbt=data.get('PBT', ''),
            latitude=data.get('latitude') or None,
            longitude=data.get('longitude') or None,
            tandas=tandas,
            playground=playground,
            parking=parking,
            surau=surau,
            deskripsi=data.get('deskripsi', ''),
            image_url=data.get('image_url', ''),
        )
        
        return JsonResponse({
            'success': True,
            'data': serialize_taman(taman, request),
            'id': taman.id
        }, status=201)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@csrf_exempt
@require_http_methods(["PUT"])
def api_update_taman(request, pk):
    """Update an existing taman"""
    try:
        taman = Taman.objects.get(id=pk)
        data = json.loads(request.body)
        
        taman.nama = data.get('nama', taman.nama)
        taman.lokasi = data.get('lokasi', taman.lokasi)
        taman.daerah = data.get('daerah', taman.daerah)
        if 'keluasan' in data:
            taman.keluasan = data.get('keluasan') or None
        taman.jenis = data.get('jenis', taman.jenis)
        taman.pbt = data.get('PBT', taman.pbt)
        if 'latitude' in data:
            taman.latitude = data.get('latitude') or None
        if 'longitude' in data:
            taman.longitude = data.get('longitude') or None
        
        # Handle both nested kemudahan object and flat facility fields
        kemudahan = data.get('kemudahan', {})
        if isinstance(kemudahan, dict):
            taman.tandas = kemudahan.get('tandas', taman.tandas)
            taman.playground = kemudahan.get('playground', taman.playground)
            taman.parking = kemudahan.get('parking', taman.parking)
            taman.surau = kemudahan.get('surau', taman.surau)
        else:
            # Use flat fields if kemudahan is not a dict
            taman.tandas = data.get('tandas', taman.tandas)
            taman.playground = data.get('playground', taman.playground)
            taman.parking = data.get('parking', taman.parking)
            taman.surau = data.get('surau', taman.surau)
        
        taman.deskripsi = data.get('deskripsi', taman.deskripsi)
        taman.image_url = data.get('image_url', taman.image_url)
        
        taman.save()
        
        return JsonResponse({
            'success': True,
            'data': serialize_taman(taman, request)
        })
    except Taman.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Taman tidak ditemukan'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def api_delete_taman(request, pk):
    """Delete a taman"""
    try:
        taman = Taman.objects.get(id=pk)
        taman.delete()
        return JsonResponse({
            'success': True,
            'message': 'Taman telah dihapus'
        })
    except Taman.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Taman tidak ditemukan'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_upload_image(request, pk):
    """Upload multiple images for a taman"""
    try:
        taman = Taman.objects.get(id=pk)
        files = request.FILES.getlist('images')
        
        if not files:
            return JsonResponse({
                'success': False,
                'error': 'Tiada fail gambar disediakan'
            }, status=400)
        
        uploaded_images = []
        for file in files:
            img = TamanImage.objects.create(
                taman=taman,
                image=file,
                caption=request.POST.get('caption', '')
            )
            uploaded_images.append({
                'id': img.id,
                'url': img.image.url,
                'caption': img.caption,
                'is_main_cover': img.is_main_cover,
            })
        
        return JsonResponse({
            'success': True,
            'images': uploaded_images
        }, status=201)
    except Taman.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Taman tidak ditemukan'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def api_delete_image(request, pk, image_id):
    """Delete an image from taman"""
    try:
        taman = Taman.objects.get(id=pk)
        image = TamanImage.objects.get(id=image_id, taman=taman)
        
        # If this was the main cover, unset it
        if image.is_main_cover:
            taman.main_cover_image = None
            taman.save()
        
        image.delete()
        return JsonResponse({
            'success': True,
            'message': 'Gambar telah dihapus'
        })
    except (Taman.DoesNotExist, TamanImage.DoesNotExist):
        return JsonResponse({
            'success': False,
            'error': 'Taman atau gambar tidak ditemukan'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_set_main_cover(request, pk, image_id):
    """Set an image as main cover for taman"""
    try:
        taman = Taman.objects.get(id=pk)
        image = TamanImage.objects.get(id=image_id, taman=taman)
        
        # Unset previous main cover
        TamanImage.objects.filter(taman=taman, is_main_cover=True).update(is_main_cover=False)
        
        # Set new main cover
        image.is_main_cover = True
        image.save()
        taman.main_cover_image = image
        taman.save()
        
        return JsonResponse({
            'success': True,
            'data': serialize_taman(taman, request)
        })
    except (Taman.DoesNotExist, TamanImage.DoesNotExist):
        return JsonResponse({
            'success': False,
            'error': 'Taman atau gambar tidak ditemukan'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
