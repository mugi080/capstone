
# api/models.py

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

from django.conf import settings


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

# models.py
class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')  # 👈 Added this

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)  # Optional first name field
    last_name = models.CharField(max_length=30, blank=True)   # Optional last name field
    address = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]  # Add first_name, last_name as required fields

    def __str__(self):
        # Use email instead of username since USERNAME_FIELD is set to "email"
        return self.email if self.email else self.first_name or "No name"


    def get_full_name(self):
        # Return full name by combining first_name and last_name
        return f"{self.first_name} {self.last_name}".strip()  # .strip() to remove any leading/trailing spaces




# Main category model (e.g., Beverages)
class BeverageCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = "Beverage Category"
        verbose_name_plural = "Beverage Categories"

    def __str__(self):
        return self.name


# Beverage model (linked to BeverageCategory)
class Beverage(models.Model):
    category = models.ForeignKey(BeverageCategory, on_delete=models.CASCADE, related_name="beverages")
    name = models.CharField(max_length=100)
    volume = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 500 ml
    price = models.DecimalField(max_digits=6, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to="beverages/", blank=True, null=True)
    units_per_case = models.PositiveIntegerField(default=24)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Beverage"
        verbose_name_plural = "Beverages"

    def __str__(self):
        return f"{self.name} - {self.volume}ml"

    def save(self, *args, **kwargs):
        self.is_available = self.stock > 0
        super().save(*args, **kwargs)

    def update_stock(self, quantity):
        if self.stock >= quantity:
            self.stock -= quantity
            self.save()
        else:
            raise ValueError("Not enough stock available.")

    @property
    def total_price(self):
        return self.price


# Order Status model
class OrderStatus(models.Model):
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.status

    class Meta:
        verbose_name = "Order Status"
        verbose_name_plural = "Order Statuses"


# Order model


# Order model
# models.py


# 👇 Define DELIVERY_CHOICES at the top
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError

DELIVERY_CHOICES = [
    ('Pickup', 'Pickup'),
    ('Delivered', 'Delivered'),
]

ORDER_STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Processing', 'Processing'),
    ('In Transit', 'In Transit'),
    ('Completed', 'Completed'),
]

class Order(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    text_address = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)

    delivery_type = models.CharField(
        max_length=9,
        choices=DELIVERY_CHOICES,
        default='Pickup'
    )

    status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='Pending'
    )

    # Assigned staff (for delivery)
    assigned_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_orders'
    )

    # Assigned vehicle (for delivery)
    assigned_vehicle = models.ForeignKey(
        'Vehicle',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Optional: Coordinates for delivery

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        name = self.user.get_full_name() if self.user else self.customer_name or "No name"
        return f"Order #{self.id} - {name} - {self.delivery_type} - {self.status}"

    def clean(self):
        # Validate coordinates
        if self.delivery_type == 'Delivered':
            if not self.latitude or not self.longitude:
                raise ValidationError("Coordinates required for delivery.")
            if not self.assigned_staff or not self.assigned_vehicle:
                raise ValidationError("Delivery must have assigned staff and vehicle.")
        elif self.delivery_type == 'Pickup':
            if self.latitude or self.longitude:
                raise ValidationError("Coordinates not needed for pickup.")
            if self.assigned_staff or self.assigned_vehicle:
                raise ValidationError("Pickup orders shouldn't have staff or vehicle.")

    def save(self, *args, **kwargs):
        # Vehicle availability logic
        if self.status == 'In Transit' and self.assigned_vehicle:
            self.assigned_vehicle.is_available = False
            self.assigned_vehicle.save()

        if self.status == 'Completed' and self.assigned_vehicle:
            self.assigned_vehicle.is_available = True
            self.assigned_vehicle.save()

        super().save(*args, **kwargs)

    @property
    def is_completed(self):
        return self.status == 'Completed'

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())

# OrderItem model
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    beverage = models.ForeignKey(Beverage, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.beverage.name} - {self.quantity} pcs"

    def save(self, *args, **kwargs):
        if not self.price:
            if self.beverage and self.beverage.price is not None:
                self.price = self.beverage.price  # Set price from beverage if not provided
            else:
                self.price = 0  # Default to 0 if no price is available
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        # Ensure neither quantity nor price is None before multiplying
        if self.quantity is None or self.price is None:
            return 0  # Return 0 if quantity or price is None
        return self.quantity * self.price



# Cart model
class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)  # Use CustomUser
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cart"
        verbose_name_plural = "Carts"

    def __str__(self):
        return f"Cart #{self.id} for User {self.user.username}"

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())


# CartItem model
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    beverage = models.ForeignKey(Beverage, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"

    def __str__(self):
        return f"{self.beverage.name} - {self.quantity} pcs"

    @property
    def total_price(self):
        return self.quantity * self.beverage.price


# Role request model

class RoleRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    requested_role = models.CharField(max_length=10, choices=CustomUser.ROLE_CHOICES)
    message = models.TextField(blank=True, null=True)  # Optional reason/explanation
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} → {self.requested_role} - {self.status}"

from django.core.exceptions import ValidationError
# Custom validation function for image file extension
def validate_image_extension(value):
    # Get file extension from the uploaded image
    file_extension = value.name.split('.')[-1].lower()
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'jfif']
    
    # Raise an error if the extension is not in the allowed list
    if file_extension not in allowed_extensions:
        raise ValidationError(f'Invalid image extension. Allowed extensions are: {", ".join(allowed_extensions)}')



class Vehicle(models.Model):
    name = models.CharField(max_length=100)
    plate_number = models.CharField(max_length=20, unique=True)
    is_available = models.BooleanField(default=True)
    capacity = models.IntegerField(default=0)  # New field for capacity

    def __str__(self):
        return f"{self.name} ({self.plate_number})"

