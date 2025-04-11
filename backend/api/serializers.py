from rest_framework import serializers
from .models import BeverageCategory, Beverage, Order, OrderItem

# Serializer for BeverageCategory
class BeverageCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BeverageCategory
        fields = '__all__'  # id, name

# Serializer for Beverage
class BeverageSerializer(serializers.ModelSerializer):
    category = BeverageCategorySerializer(read_only=True)

    class Meta:
        model = Beverage
        fields = [
            'id', 'name', 'category', 'volume', 'price',
            'stock', 'is_available', 'created_at', 'updated_at', 'image'
        ]

# Serializer for OrderItem
class OrderItemSerializer(serializers.ModelSerializer):
    beverage = BeverageSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'beverage', 'quantity', 'price', 'total_price']

    def get_total_price(self, obj):
        return obj.quantity * obj.price

# serializer for Order
class OrderSerializer(serializers.ModelSerializer):
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)  # Include order items

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_price', 'is_completed', 'status', 'created_at', 'updated_at', 'items'
        ]