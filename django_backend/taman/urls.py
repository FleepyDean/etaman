from django.urls import path
from . import admin_api
from . import views, api

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('taman/<int:pk>/', views.profil_taman, name='profil_taman'),
    path('taman/<int:pk>/delete/', views.delete_taman, name='delete_taman'),
    path('export/csv/', views.export_csv, name='export_csv'),
    
    # API Endpoints
    path('api/taman/', api.api_list_taman, name='api_list_taman'),
    path('api/taman/create/', api.api_create_taman, name='api_create_taman'),
    path('api/taman/<int:pk>/', api.api_get_taman, name='api_get_taman'),
    path('api/taman/<int:pk>/update/', api.api_update_taman, name='api_update_taman'),
    path('api/taman/<int:pk>/delete/', api.api_delete_taman, name='api_delete_taman'),
    
    # Image Endpoints
    path('api/taman/<int:pk>/upload-image/', api.api_upload_image, name='api_upload_image'),
    path('api/taman/<int:pk>/image/<int:image_id>/delete/', api.api_delete_image, name='api_delete_image'),
    path('api/taman/<int:pk>/image/<int:image_id>/set-main-cover/', api.api_set_main_cover, name='api_set_main_cover'),

# Master Data (Daerah)
    path('api/master/daerah/', admin_api.daerah_list, name='daerah_list'),
    path('api/master/daerah/create/', admin_api.daerah_list, name='daerah_create'),
    path('api/master/daerah/<int:pk>/update/', admin_api.daerah_update, name='daerah_update'),
    path('api/master/daerah/<int:pk>/delete/', admin_api.daerah_delete, name='daerah_delete'),

    # Master Data (Status Tanah)
    path('api/master/status-tanah/', admin_api.status_tanah_list, name='status_tanah_list'),
    path('api/master/status-tanah/create/', admin_api.status_tanah_list, name='status_tanah_create'),
    path('api/master/status-tanah/<int:pk>/update/', admin_api.status_tanah_update, name='status_tanah_update'),
    path('api/master/status-tanah/<int:pk>/delete/', admin_api.status_tanah_delete, name='status_tanah_delete'),

    # Master Data (Facility)
    path('api/master/facility/', admin_api.facility_list, name='facility_list'),
    path('api/master/facility/create/', admin_api.facility_list, name='facility_create'),
    path('api/master/facility/<int:pk>/update/', admin_api.facility_update, name='facility_update'),
    path('api/master/facility/<int:pk>/delete/', admin_api.facility_delete, name='facility_delete'),

    # User Account Management (For System Admin)
    path('api/admin/users/', admin_api.user_list, name='admin_user_list'),
    path('api/admin/users/<int:pk>/<str:action>/', admin_api.user_toggle_status, name='admin_user_toggle'),
    path('api/admin/users/<int:pk>/assign/', admin_api.user_assign_role, name='admin_user_assign'),

    # Audit Logs (For System Admin)
    path('api/admin/audit-logs/', admin_api.audit_log_list, name='audit_log_list'),
]
