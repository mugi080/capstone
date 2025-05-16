from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    get_categories, get_beverages, get_beverage_detail,
    place_order, get_user_orders, update_order, delete_order,
    get_admin_orders, RoleRequestViewSet, RoleRequestAdminViewSet,
    BeverageCategoryViewSet, BeverageViewSet, OrderViewSet,
    CustomerAdminViewSet, StaffAdminViewSet , VehicleViewSet # 👈 ADD THIS
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'role-requests', RoleRequestViewSet, basename='role-request')
router.register(r'admin/role-requests', RoleRequestAdminViewSet, basename='admin-role-request')
router.register(r'categories', BeverageCategoryViewSet, basename='beverage-category')
router.register(r'beverages', BeverageViewSet, basename='beverage')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'admin/staff', StaffAdminViewSet, basename='admin-staff')  # ✅ Add admin/staff CRUD endpoint
router.register(r'vehicles', VehicleViewSet, basename='vehicle')  # ✅ Add vehicle CRUD endpoint
# ✅ Add admin/customer CRUD endpoint
router.register(r'admin/customers', CustomerAdminViewSet, basename='admin-customers')

urlpatterns = [
    # BEVERAGE (custom)
    path('custom-categories/', get_categories),
    path('custom-beverages/', get_beverages),
    path('custom-beverages/<int:pk>/', get_beverage_detail),

    # ORDER (custom)
    path('place_order/', place_order),
    path('user/orders/', get_user_orders),
    path('orders/<int:order_id>/update/', update_order),
    path('orders/<int:order_id>/delete/', delete_order),

    # ADMIN (custom)
    path('admin/orders/', get_admin_orders),
]

# Add routes from the router (for the ViewSets)
urlpatterns += router.urls
