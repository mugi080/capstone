import logging
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db import transaction
from .models import (
    BeverageCategory,
    Beverage,
    Order,
    OrderItem,
)
from .serializers import (
    BeverageCategorySerializer,
    BeverageSerializer,
    OrderSerializer,
)

logger = logging.getLogger(__name__)

# ----------------------------- BEVERAGE VIEWS -----------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    """
    Get all beverage categories (public access)
    """
    try:
        categories = BeverageCategory.objects.all()
        serializer = BeverageCategorySerializer(categories, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        return Response({"error": "Failed to retrieve categories."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([AllowAny])
def get_beverages(request):
    """
    Get all beverages (public access)
    """
    try:
        beverages = Beverage.objects.all()
        serializer = BeverageSerializer(beverages, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching beverages: {str(e)}")
        return Response({"error": "Failed to retrieve beverages."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_beverage_detail(request, pk):
    try:
        beverage = Beverage.objects.get(pk=pk)
        serializer = BeverageSerializer(beverage)
        return Response(serializer.data)
    except Beverage.DoesNotExist:
        return Response({"error": "Beverage not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching beverage details: {str(e)}")
        return Response({"error": "Failed to retrieve beverage details."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ----------------------------- ORDER FUNCTIONALITY -----------------------------
# views.py


from geopy.geocoders import Nominatim
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem, Beverage
from django.db import transaction
import logging

logger = logging.getLogger(__name__)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    try:
        data = request.data
        items = data.get("items")
        address = data.get("address")
        payment_method = data.get("payment_method")
        delivery_type = data.get("delivery_type", "Pickup")
        text_address = data.get("textAddress", "")
        contact_number = data.get("contact_number", "")

        logger.info(f"DELIVERY TYPE RECEIVED: {delivery_type}")
        logger.info(f"Order Data Received: {data}")

        if not isinstance(items, list) or not items:
            return Response({"error": "Invalid or missing items list."}, status=status.HTTP_400_BAD_REQUEST)

        if delivery_type == "Delivered":
            if not address:
                return Response({"error": "Address is required for delivery."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                location = Nominatim(user_agent="order_app").reverse(address, language='en', exactly_one=True)
                if location:
                    text_address = location.address
                else:
                    text_address = "Unknown Address"
            except Exception:
                text_address = "Unknown Address"

        if delivery_type not in ["Pickup", "Delivered"]:
            return Response({"error": "Invalid delivery type."}, status=status.HTTP_400_BAD_REQUEST)

        order_data = {
            "user": request.user.id,
            "address": address,
            "payment_method": payment_method,
            "delivery_type": delivery_type,
            "text_address": text_address,
            "contact_number": contact_number,
        }

        serializer = OrderSerializer(data=order_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = serializer.save()
            order_items = []

            for item in items:
                beverage_id = item.get("id")
                quantity = item.get("quantity", 1)

                if not beverage_id or quantity <= 0:
                    return Response({"error": "Invalid beverage ID or quantity."}, status=status.HTTP_400_BAD_REQUEST)

                beverage = Beverage.objects.filter(id=beverage_id).first()
                if not beverage:
                    return Response({"error": f"Beverage with ID {beverage_id} not found."}, status=status.HTTP_404_NOT_FOUND)
                if beverage.stock < quantity:
                    return Response({"error": f"Not enough stock for {beverage.name}. Available: {beverage.stock}"}, status=status.HTTP_400_BAD_REQUEST)

                beverage.stock -= quantity
                beverage.save()

                order_item = OrderItem.objects.create(
                    order=order,
                    beverage=beverage,
                    quantity=quantity,
                    price=beverage.price,
                )

                order_items.append({
                    "beverage": beverage.name,
                    "quantity": quantity,
                    "unit_price": str(beverage.price),
                    "total_price": str(order_item.total_price),
                })

            return Response({
                "message": "Order placed successfully.",
                "order_id": order.id,
                "delivery_type": delivery_type,
                "items": order_items,
                "total_price": str(order.total_price),
                "text_address": text_address,
                "contact_number": contact_number,
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.exception("Order placement failed.")
        return Response({"error": "An error occurred while placing the order."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ----------------------------- USER ORDERS -----------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    """
    Retrieve all orders for the logged-in user
    """
    try:
        user_orders = Order.objects.filter(user=request.user).order_by("-created_at")
        serializer = OrderSerializer(user_orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error retrieving user orders: {str(e)}")
        return Response({"error": "Failed to fetch user orders."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ----------------------------- UPDATE AND DELETE ORDER -----------------------------
from datetime import timedelta
from django.utils import timezone

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)

        # Check if the order is older than 30 minutes
        if timezone.now() - order.created_at > timedelta(minutes=30):
            return Response({"error": "You can only update orders within 30 minutes."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Validate input
        items = request.data.get("items")
        address = request.data.get("address")
        payment_method = request.data.get("payment_method")

        if not isinstance(items, list) or not items:
            return Response({"error": "Invalid or missing items list."}, status=status.HTTP_400_BAD_REQUEST)

        validated_items = []
        for item in items:
            beverage_id = item.get("id")
            quantity = item.get("quantity", 1)

            if not beverage_id or quantity <= 0:
                return Response({"error": "Invalid beverage ID or quantity."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                beverage = Beverage.objects.get(id=beverage_id)
            except Beverage.DoesNotExist:
                return Response({"error": f"Beverage with ID {beverage_id} not found."}, status=status.HTTP_404_NOT_FOUND)

            if beverage.stock < quantity:
                return Response({
                    "error": f"Not enough stock for {beverage.name}. Available: {beverage.stock}"
                }, status=status.HTTP_400_BAD_REQUEST)

            validated_items.append((beverage, quantity))

        # Step 2: If validation passed, proceed with update
        updated_items = []
        with transaction.atomic():
            OrderItem.objects.filter(order=order).delete()

            for beverage, quantity in validated_items:
                beverage.stock -= quantity
                beverage.save()

                order_item = OrderItem.objects.create(
                    order=order,
                    beverage=beverage,
                    quantity=quantity,
                    price=beverage.price,
                )

                updated_items.append({
                    "beverage": beverage.name,
                    "quantity": quantity,
                    "unit_price": str(beverage.price),
                    "total_price": str(order_item.total_price),
                })

            # Update address and payment method if provided
            if address:
                order.address = address
            if payment_method:
                order.payment_method = payment_method

            order.save()

        return Response({
            "message": "Order updated successfully.",
            "order_id": order.id,
            "items": updated_items,
            "total_price": str(order.total_price),
            "address": order.address,
            "payment_method": order.payment_method,
        }, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error updating order: {str(e)}")
        return Response({"error": "Failed to update order."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_order(request, order_id):
    """
    Delete an order for an authenticated user and restore beverage stock
    """
    try:
        order = Order.objects.get(id=order_id, user=request.user)

        with transaction.atomic():
            # ✅ Restore stock for each beverage in the order
            for item in order.items.all():
                item.beverage.stock += item.quantity
                item.beverage.save()

            # ✅ Now remove associated order items and delete the order
            OrderItem.objects.filter(order=order).delete()
            order.delete()

        return Response({"message": "Order deleted successfully and stock restored."}, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error deleting order: {str(e)}")
        return Response({"error": "Failed to delete order."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ----------------------------- UPDATE USER PROFILE -----------------------------


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update the logged-in user's profile (e.g., name, address, contact number)
    """
    try:
        # Get the authenticated user
        user = request.user

        # Get the new fields from the request data
        new_name = request.data.get("name")
        new_address = request.data.get("address")
        new_contact_number = request.data.get("contact_number")

        # Validate the new name if provided
        if new_name is not None:
            user.first_name = new_name

        # Validate the new address if provided
        if new_address is not None:
            user.address = new_address

        # Validate the new contact number if provided
        if new_contact_number is not None:
            user.contact_number = new_contact_number

        # Save the updated user object
        user.save()

        return Response({
            "message": "Profile updated successfully.",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "email": user.email,
                "address": user.address,
                "contact_number": user.contact_number
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        return Response({"error": "Failed to update profile."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# backend/api/views.py


# -----------------------------  admin  -----------------------------

# api/views.py
# views.py
# views.py
# ----------------------------- ADMIN ORDER VIEW -----------------------------
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Order
from .serializers import OrderSerializer
from rest_framework import status

# Admin Orders view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_orders(request):
    """
    Retrieve all orders (for admin users)
    """
    try:
        if not request.user.is_staff:  # Check if the user is an admin
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        orders = Order.objects.all().order_by("-created_at")
        
        # Serialize the orders and check for users being None (guest orders)
        orders_data = []
        for order in orders:
            order_data = OrderSerializer(order).data
            print(f"Order Data: {order_data}")  # Check the serialized data
            orders_data.append(order_data)


        return Response(orders_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error retrieving admin orders: {str(e)}")
        return Response({"error": "Failed to fetch orders."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

from rest_framework import viewsets, permissions
from .models import RoleRequest
from .serializers import RoleRequestSerializer

class RoleRequestViewSet(viewsets.ModelViewSet):
    serializer_class = RoleRequestSerializer
    permission_classes = [permissions.IsAuthenticated]  # Ensure that only authenticated users can access this

    def get_queryset(self):
        # Filter role requests so that users only see their own requests
        return RoleRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Ensure the user who is submitting the request is the one attached to the request
        serializer.save(user=self.request.user)
    


# views.py requests.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import RoleRequest
from .serializers import RoleRequestSerializer

class RoleRequestAdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]  # Only admin users can access this view

    def list(self, request):
        # Admin can see all the pending role requests
        requests = RoleRequest.objects.filter(status='pending')  # Use status instead of is_approved
        serializer = RoleRequestSerializer(requests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        try:
            role_request = RoleRequest.objects.get(pk=pk)
            if role_request.status == 'approved':  # Check for approved status
                return Response({'detail': 'Already approved.'}, status=400)

            role_request.status = 'approved'  # Change status to 'approved'
            role_request.save()

            # Update the user's role after approval
            user = role_request.user
            user.role = role_request.requested_role  # Set the new role
            if user.role == 'staff':
                user.is_staff = True  # Give staff permissions
            elif user.role == 'admin':
                user.is_staff = True
                user.is_superuser = True  # Grant admin permissions

            user.save()

            return Response({'detail': 'Role request approved and user role updated.'}, status=200)

        except RoleRequest.DoesNotExist:
            return Response({'detail': 'RoleRequest not found.'}, status=404)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        try:
            role_request = RoleRequest.objects.get(pk=pk)
            if role_request.status == 'rejected':  # Check if already rejected
                return Response({'detail': 'Already rejected.'}, status=400)

            role_request.status = 'rejected'  # Change status to 'rejected'
            role_request.save()

            return Response({'detail': 'Role request rejected.'}, status=200)

        except RoleRequest.DoesNotExist:
            return Response({'detail': 'RoleRequest not found.'}, status=404)


# ----------------------------
# BeverageCategory CRUD ViewSet
# ----------------------------


from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Beverage, BeverageCategory
from .serializers import BeverageSerializer, BeverageCategorySerializer

class BeverageCategoryViewSet(viewsets.ModelViewSet):
    queryset = BeverageCategory.objects.all()
    serializer_class = BeverageCategorySerializer
    permission_classes = [IsAdminUser | IsAuthenticatedOrReadOnly] 
# ----------------------------
# Beverage CRUD ViewSet
# ----------------------------
class BeverageViewSet(viewsets.ModelViewSet):
    queryset = Beverage.objects.all()
    serializer_class = BeverageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]





#------------------------------
#try


from .permissions import IsAdminOrStaff 
from rest_framework import viewsets, serializers
from rest_framework.permissions import IsAdminUser
from .models import Order, Beverage
from .serializers import OrderAdminSerializer, OrderSerializer

from rest_framework import viewsets, serializers
from .permissions import IsAdminOrStaff
from .models import Order, Beverage
from .serializers import OrderAdminSerializer, OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrStaff]
    
    def get_queryset(self):
        """
        Return all orders, optionally filtered by query parameters like status.
        Ensures DRF can retrieve/update specific orders.
        """
        queryset = Order.objects.all()
        status = self.request.query_params.get('status', None)

        if status:
            queryset = queryset.filter(status=status)

        return queryset

    def get_serializer_class(self):
        """
        Use different serializers based on user role.
        """
        if self.request.user.is_staff:
            return OrderAdminSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        """
        Validate stock before creating the order.
        Deduct stock after successful validation.
        """
        items_data = self.request.data.get('items', [])

        if not items_data:
            raise serializers.ValidationError("Order must include at least one item.")

        try:
            # First pass: check stock
            for item_data in items_data:
                beverage_id = item_data.get('beverage')
                quantity = item_data.get('quantity', 0)

                if not beverage_id or quantity <= 0:
                    raise serializers.ValidationError(f"Invalid item data: {item_data}")

                try:
                    beverage = Beverage.objects.get(id=beverage_id)
                except Beverage.DoesNotExist:
                    raise serializers.ValidationError(f"Beverage with ID {beverage_id} does not exist.")

                if beverage.stock < quantity:
                    raise serializers.ValidationError(
                        f"Not enough stock for '{beverage.name}'. Available: {beverage.stock}, Requested: {quantity}"
                    )

            # Second pass: save order
            if self.request.user.is_staff:
                order = serializer.save()
            else:
                order = serializer.save(user=self.request.user)

            # Third pass: deduct stock
            for item in order.items.all():
                item.beverage.update_stock(item.quantity)

        except ValueError as e:
            raise serializers.ValidationError(str(e))
        
# views.py
from rest_framework import viewsets, permissions
from .models import CustomUser
from .serializers import CustomUserSerializer

class CustomerAdminViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role='user')  # Only regular users
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAdminUser]  # Only admin/staff can access

from .serializers import StaffSerializer
class StaffAdminViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role='staff')  # Only staff users
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAdminUser]
    
    

# ----------------------------
# is addmin or staff

    
# views.py

from .permissions import IsAdminOrStaff  # Import the custom permission
from rest_framework import viewsets
from .models import Vehicle
from .serializers import VehicleSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAdminOrStaff]  # Apply the custom permission here


from django.shortcuts import render

def serve_react(request):
    return render(request, "index.html")
