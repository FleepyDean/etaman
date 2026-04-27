from django.urls import path

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
]
