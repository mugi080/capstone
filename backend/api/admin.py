from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, BeverageCategory, Beverage,
    Order, OrderItem, OrderStatus,
    Cart, CartItem
)

from .models import RoleRequest

from django.utils.translation import gettext_lazy as _


# ----------------------------
# Custom User Admin
# ----------------------------
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser  # Ensure this import exists

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("id", "email", "get_full_name", "contact_number", "address", "role", "is_staff", "is_active")
    search_fields = ("email", "first_name", "last_name", "contact_number")
    ordering = ("email",)
    exclude = ("username",)

    fieldsets = (
        (_("Login Info"), {"fields": ("email", "password")}),
        (_("Personal Info"), {"fields": ("first_name", "last_name", "contact_number", "address")}),
        (_("Role & Permissions"), {"fields": ("role", "is_active", "groups", "user_permissions")}),  # Removed is_staff, is_superuser
        (_("Important Dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (_("Create User"), {
            "classes": ("wide",),
            "fields": (
                "email", "password1", "password2",
                "first_name", "last_name", "contact_number", "address",
                "role", "is_active", "groups", "user_permissions"  # Removed is_staff, is_superuser
            )
        }),
    )

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = "Full Name"

    def save_model(self, request, obj, form, change):
        new_role = form.cleaned_data.get("role") or obj.role
        if new_role == 'admin':
            obj.is_staff = True
            obj.is_superuser = True
        elif new_role == 'staff':
            obj.is_staff = True
            obj.is_superuser = False
        elif new_role == 'user':
            obj.is_staff = False
            obj.is_superuser = False

        obj.role = new_role
        super().save_model(request, obj, form, change)











# ----------------------------
# Beverage Category Admin
# ----------------------------
@admin.register(BeverageCategory)
class BeverageCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    ordering = ("name",)


# ----------------------------
# Beverage Admin
# ----------------------------
@admin.register(Beverage)
class BeverageAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "volume", "price", "stock", "is_available", "created_at", "updated_at")
    list_filter = ("category", "is_available")
    search_fields = ("name",)
    ordering = ("-created_at",)


# ----------------------------
# Inline: Order Items
# ----------------------------
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("total_price",)


# ----------------------------
# Order Admin
# ----------------------------
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "delivery_type", "status", "is_completed", "created_at", "updated_at")
    list_filter = ("delivery_type", "status", "user")
    search_fields = ("user__email",)
    inlines = [OrderItemInline]
    ordering = ("-created_at",)
    readonly_fields = ("total_price",)



# ----------------------------
# Order Item Admin (optional)
# ----------------------------
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "beverage", "quantity", "price", "total_price")
    search_fields = ("order__id", "beverage__name")
    ordering = ("order", "beverage")


admin.site.register(RoleRequest)