import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .models import Daerah, StatusTanah, Facility, UserProfile, AuditLog


def error_resp(msg, status=400):
    return JsonResponse({'success': False, 'error': msg}, status=status)


def parse_json_body(request):
    """Safely parse JSON body from request."""
    try:
        return json.loads(request.body)
    except json.JSONDecodeError:
        return None


# MASTER DATA: DAERAH
@csrf_exempt
def daerah_list(request):
    if request.method == 'GET':
        data = list(Daerah.objects.values())
        return JsonResponse({'success': True, 'data': data})
    elif request.method == 'POST':
        body = parse_json_body(request)
        if body is None:
            return error_resp('Invalid JSON')
        nama = body.get('nama', '').strip()
        if not nama:
            return error_resp('Nama daerah diperlukan')
        if Daerah.objects.filter(nama=nama).exists():
            return error_resp('Nama daerah sudah wujud')
        obj = Daerah.objects.create(nama=nama)
        return JsonResponse({'success': True, 'data': {'id': obj.id, 'nama': obj.nama, 'status': obj.status}})
    return error_resp('Method not allowed', 405)

@csrf_exempt
def daerah_update(request, pk):
    if request.method == 'PUT':
        body = parse_json_body(request)
        if body is None:
            return error_resp('Invalid JSON')
        obj = get_object_or_404(Daerah, pk=pk)
        nama = body.get('nama', '').strip()
        if not nama:
            return error_resp('Nama daerah diperlukan')
        if Daerah.objects.filter(nama=nama).exclude(pk=pk).exists():
            return error_resp('Nama daerah sudah wujud')
        obj.nama = nama
        obj.save()
        return JsonResponse({'success': True, 'data': {'id': obj.id, 'nama': obj.nama, 'status': obj.status}})
    return error_resp('Method not allowed', 405)

@csrf_exempt
def daerah_delete(request, pk):
    if request.method == 'DELETE':
        obj = get_object_or_404(Daerah, pk=pk)
        # obj.status = 'Inactive'
        # obj.save()
        obj.delete()
        
        return JsonResponse({'success': True})
    return error_resp('Method not allowed', 405)


# MASTER DATA: STATUS TANAH
@csrf_exempt
def status_tanah_list(request):
    if request.method == 'GET':
        data = list(StatusTanah.objects.values())
        return JsonResponse({'success': True, 'data': data})
    elif request.method == 'POST':
        body = parse_json_body(request)
        if body is None:
            return error_resp('Invalid JSON')
        nama = body.get('nama', '').strip()
        if not nama:
            return error_resp('Nama status tanah diperlukan')
        if StatusTanah.objects.filter(nama=nama).exists():
            return error_resp('Nama status tanah sudah wujud')
        obj = StatusTanah.objects.create(
            nama=nama,
            keterangan=body.get('keterangan', '')
        )
        return JsonResponse({'success': True, 'data': {'id': obj.id, 'nama': obj.nama, 'status': obj.status}})
    return error_resp('Method not allowed', 405)

@csrf_exempt
def status_tanah_update(request, pk):
    if request.method == 'PUT':
        body = parse_json_body(request)
        if body is None:
            return error_resp('Invalid JSON')
        obj = get_object_or_404(StatusTanah, pk=pk)
        nama = body.get('nama', '').strip()
        if not nama:
            return error_resp('Nama diperlukan')
        if StatusTanah.objects.filter(nama=nama).exclude(pk=pk).exists():
            return error_resp('Nama sudah wujud')
        obj.nama = nama
        obj.keterangan = body.get('keterangan', obj.keterangan)
        obj.save()
        return JsonResponse({'success': True})
    return error_resp('Method not allowed', 405)

@csrf_exempt
def status_tanah_delete(request, pk):
    if request.method == 'DELETE':
        obj = get_object_or_404(StatusTanah, pk=pk)
        obj.status = 'Inactive'
        obj.save()
        return JsonResponse({'success': True})
    return error_resp('Method not allowed', 405)


# MASTER DATA: FACILITY 
@csrf_exempt
def facility_list(request):
    if request.method == 'GET':
        data = list(Facility.objects.values())
        return JsonResponse({'success': True, 'data': data})
    elif request.method == 'POST':
        body = parse_json_body(request)
        if body is None:
            return error_resp('Invalid JSON')
        nama = body.get('nama', '').strip()
        if not nama:
            return error_resp('Nama kemudahan diperlukan')
        if Facility.objects.filter(nama=nama).exists():
            return error_resp('Nama kemudahan sudah wujud')
        obj = Facility.objects.create(
            nama=nama,
            kategori=body.get('kategori', '')
        )
        return JsonResponse({'success': True, 'data': {'id': obj.id, 'nama': obj.nama, 'status': obj.status}})
    return error_resp('Method not allowed', 405)

@csrf_exempt
def facility_update(request, pk):
    if request.method == 'PUT':
        body = parse_json_body(request)
        if body is None:
            return error_resp('Invalid JSON')
        obj = get_object_or_404(Facility, pk=pk)
        nama = body.get('nama', '').strip()
        if not nama:
            return error_resp('Nama diperlukan')
        if Facility.objects.filter(nama=nama).exclude(pk=pk).exists():
            return error_resp('Nama sudah wujud')
        obj.nama = nama
        obj.kategori = body.get('kategori', obj.kategori)
        obj.save()
        return JsonResponse({'success': True})
    return error_resp('Method not allowed', 405)

@csrf_exempt
def facility_delete(request, pk):
    if request.method == 'DELETE':
        obj = get_object_or_404(Facility, pk=pk)
        obj.status = 'Inactive'
        obj.save()
        return JsonResponse({'success': True})
    return error_resp('Method not allowed', 405)


# USER ACCOUNT MANAGEMENT 
@csrf_exempt
def user_list(request):
    if request.method == 'GET':
        users = User.objects.select_related('profile').all()
        data = []
        for u in users:
            profile = getattr(u, 'profile', None)
            data.append({
                'id': u.id,
                'name': u.get_full_name() or u.username,
                'email': u.email,
                'district': profile.district.nama if profile and profile.district else '',
                'role': profile.role if profile else 'PBT_OFFICER',
                'status': profile.status if profile else 'Active',
                'last_login': u.last_login.strftime('%Y-%m-%d %H:%M') if u.last_login else '-'
            })
        return JsonResponse({'success': True, 'data': data})
    return error_resp('Method not allowed', 405)


def user_toggle_status(request, pk, action):
    if request.method == 'POST':
        user = get_object_or_404(User, pk=pk)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if action == 'activate':
            profile.status = 'Active'
            user.is_active = True
        elif action == 'deactivate':
            profile.status = 'Inactive'
            user.is_active = False
        else:
            return error_resp('Invalid action')
        user.save()
        profile.save()
        return JsonResponse({'success': True})
    return error_resp('Method not allowed', 405)

@csrf_exempt
def user_assign_role(request, pk):
    if request.method == 'POST':
        body = parse_json_body(request)
        if body is None:
            return error_resp('Invalid JSON')
        user = get_object_or_404(User, pk=pk)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        district_nama = body.get('district')
        role = body.get('role')
        if district_nama:
            district = get_object_or_404(Daerah, nama=district_nama)
            profile.district = district
        if role in ['JLNJ_ADMIN', 'PBT_OFFICER']:
            profile.role = role
        profile.save()
        return JsonResponse({'success': True})
    return error_resp('Method not allowed', 405)


# AUDIT LOG 
@csrf_exempt
def audit_log_list(request):
    if request.method == 'GET':
        queryset = AuditLog.objects.select_related('user').all()
        user_email = request.GET.get('user', '').strip()
        action = request.GET.get('action', '').strip()
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')

        if user_email:
            queryset = queryset.filter(user__email__icontains=user_email)
        if action:
            queryset = queryset.filter(action_type=action)
        if start_date:
            queryset = queryset.filter(timestamp__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__date__lte=end_date)

        page = int(request.GET.get('page', 1))
        per_page = 20
        total = queryset.count()
        total_pages = (total + per_page - 1) // per_page
        offset = (page - 1) * per_page
        logs = queryset[offset:offset + per_page]

        data = [{
            'id': log.id,
            'user_email': log.user.email if log.user else 'System',
            'action_type': log.action_type,
            'description': log.description,
            'ip_address': log.ip_address or '-',
            'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        } for log in logs]

        return JsonResponse({
            'success': True,
            'data': data,
            'page': page,
            'total_pages': total_pages,
            'total': total
        })
    return error_resp('Method not allowed', 405)