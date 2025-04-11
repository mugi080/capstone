from django.contrib import admin
from .models import BeverageCategory, Beverage, Order, OrderItem, Cart, CartItem, OrderStatus


@admin.register(BeverageCategory)
class BeverageCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Beverage)
class BeverageAdmin(admin.ModelAdmin):
    list_display = (
        "name", "category", "volume", "price", "stock", "is_available", "updated_at", "created_at"
    )
    list_filter = ("category", "is_available")
    search_fields = ("name",)
    ordering = ("name",)
    list_editable = ("price", "stock", "is_available")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("total_price",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_price", "is_completed", "created_at", "updated_at")
    list_filter = ("is_completed", "user", "status")
    search_fields = ("user__username",)
    inlines = [OrderItemInline]
    ordering = ("-created_at",)
    readonly_fields = ("total_price",)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "beverage", "quantity", "price", "total_price")
    search_fields = ("order__id", "beverage__name")
    ordering = ("order",)


@admin.register(OrderStatus)
class OrderStatusAdmin(admin.ModelAdmin):
    list_display = ("id", "status")
    search_fields = ("status",)
    ordering = ("status",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at")
    search_fields = ("user__username",)
    ordering = ("-created_at",)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "beverage", "quantity", "total_price")
    search_fields = ("cart__id", "beverage__name")
    ordering = ("cart",)
