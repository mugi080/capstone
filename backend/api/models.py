from django.db import models
from django.contrib.auth.models import User


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
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.ForeignKey(OrderStatus, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order #{self.id} - Status: {self.status} - Total: Php{self.total_price}"

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())


# OrderItem model
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    beverage = models.ForeignKey(Beverage, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.beverage.name} - {self.quantity} pcs"

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.beverage.price  # Ensure price is set from the beverage if not provided
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        return self.quantity * self.price


# Cart model
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
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

