# permissions.py

from rest_framework.permissions import BasePermission

class IsAdminOrStaff(BasePermission):
    """
    Custom permission to grant access to both admins and staff.
    """
    def has_permission(self, request, view):
        # Ensure the user is authenticated and either staff or admin
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)
