from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    BeverageCategory, Beverage, Order, OrderItem, CustomUser,
    Cart, CartItem, DELIVERY_CHOICES
)

# ----------------------------
# Beverage Category Serializer
# ----------------------------
class BeverageCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BeverageCategory
        fields = '__all__'

# For Beverages with full CRUD support
class BeverageSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=BeverageCategory.objects.all())

    class Meta:
        model = Beverage
        fields = [
            'id', 'name', 'category', 'volume', 'price',
            'stock', 'is_available', 'created_at', 'updated_at', 'image',
            'units_per_case',
        ]
        read_only_fields = ['created_at', 'updated_at']

# ----------------------------
# Order Item Serializer
# ----------------------------# serializers.py




class OrderItemSerializer(serializers.ModelSerializer):
    beverage = serializers.StringRelatedField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'beverage', 'quantity', 'price', 'total_price']

    def get_total_price(self, obj):
        if obj.quantity is None or obj.price is None:
            return 0
        return obj.quantity * obj.price



from rest_framework import serializers
from .models import Order, OrderItem, CustomUser

class OrderSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)  # Use CustomUser here
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'customer_name', 'address', 'text_address',
            'payment_method', 'delivery_type', 'is_completed',
            'created_at', 'updated_at', 'items', 'total_price', 'contact_number',
            # Include new fields here
        ]

    def get_total_price(self, obj):
        return obj.total_price

    def validate(self, data):
        user = data.get('user')
        name = data.get('customer_name') or self.instance.customer_name if self.instance else None
        if not user and not name:
            raise serializers.ValidationError("Either a user or a customer_name must be provided.")
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Auto-fill customer_name if user is logged in and it's not provided
        user = validated_data.get('user', None)
        customer_name = validated_data.get('customer_name', None)

        if user and not customer_name:
            # If the user is logged in, combine first_name and last_name to create full name
            customer_name = f"{user.first_name} {user.last_name}".strip()

        validated_data['customer_name'] = customer_name  # Set the customer_name for the order

        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order





# ----------------------------
# Cart Item Serializer
# ----------------------------
class CartItemSerializer(serializers.ModelSerializer):
    beverage = BeverageSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'beverage', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.quantity * obj.beverage.price

# ----------------------------
# Cart Serializer
# ----------------------------
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'items', 'total_price']

    def get_total_price(self, obj):
        return sum(item.quantity * item.beverage.price for item in obj.items.all())

# ----------------------------
# Custom Djoser User Create Serializer
# ----------------------------
class CustomUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    re_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'password', 're_password',
            'contact_number', 'address'
        ]

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, data):
        if data['password'] != data['re_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('re_password')
        password = validated_data.pop('password')

        request = self.context.get('request')
        is_admin = request and request.user.is_authenticated and request.user.is_staff

        if is_admin:
            is_staff = self.context['request'].data.get('is_staff', False)
            user = CustomUser.objects.create_user(
                is_staff=is_staff,
                password=password,
                **validated_data
            )
        else:
            user = CustomUser.objects.create_user(
                password=password,
                **validated_data
            )
        return user

# ----------------------------
# Custom User Read Serializer
# ----------------------------
from djoser.serializers import UserSerializer as DjoserUserSerializer

class CustomUserReadSerializer(DjoserUserSerializer):
    class Meta(DjoserUserSerializer.Meta):
        model = CustomUser
        fields = DjoserUserSerializer.Meta.fields + ('is_staff', 'is_superuser')


# serializers.py


from rest_framework import serializers
from .models import RoleRequest

# serializers.py
from rest_framework import serializers
from .models import RoleRequest

class RoleRequestSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = RoleRequest
        fields = ['id', 'user', 'requested_role', 'message', 'status', 'created_at']
        read_only_fields = ['status', 'created_at', 'user']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name(),
        }

    def create(self, validated_data):
        request = self.context['request']
        validated_data['user'] = request.user
        return super().create(validated_data)
    

#-----------------------------
# Admin Serializer
#-----------------------------

from .models import CustomUser, Order, OrderItem
from rest_framework import serializers
from .models import OrderItem, Beverage, CustomUser, Order

class OrderItemAdminSerializer(serializers.ModelSerializer):
    beverage = serializers.PrimaryKeyRelatedField(queryset=Beverage.objects.all())  # Expecting beverage ID
    total_price = serializers.SerializerMethodField()
    beverage_image_url = serializers.SerializerMethodField()  # Custom field for image URL

    class Meta:
        model = OrderItem
        fields = ['id', 'beverage', 'quantity', 'price', 'total_price', 'beverage_image_url']

    def get_total_price(self, obj):
        if obj.quantity is None or obj.price is None:
            return 0
        return obj.quantity * obj.price

    def get_beverage_image_url(self, obj):
        if obj.beverage and obj.beverage.image:
            return obj.beverage.image.url  # This returns the URL to the image
        return None

class OrderAdminSerializer(serializers.ModelSerializer):
    items = OrderItemAdminSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'total_price']

    def validate(self, data):
        user = data.get('user')
        name = data.get('customer_name') or (self.instance.customer_name if self.instance else None)
        if not user and not name:
            raise serializers.ValidationError("You must provide either a registered user or a customer name.")
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            beverage = item_data.pop('beverage')
            OrderItem.objects.create(order=order, beverage=beverage, **item_data)

        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        for item_data in items_data:
            item_id = item_data.get('id')
            if item_id:
                item = OrderItem.objects.get(id=item_id)
                item.quantity = item_data.get('quantity', item.quantity)
                item.price = item_data.get('price', item.price)
                if 'beverage' in item_data:
                    item.beverage = Beverage.objects.get(id=item_data['beverage'])
                item.save()
            else:
                beverage = Beverage.objects.get(id=item_data['beverage'])
                OrderItem.objects.create(order=instance, beverage=beverage, **item_data)

        return instance



#-------------------------------
#user serializer
#-------------------------------
# serializers.py
from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'address', 'contact_number', 'role',
            'is_active', 'date_joined'
        ]
        read_only_fields = ['date_joined']
#-------------------------------
#staff serializer
#-------------------------------

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'address', 'contact_number', 'role',
            'is_active', 'date_joined'
        ]
        read_only_fields = ['date_joined']


from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'name', 'plate_number', 'is_available', 'capacity']
