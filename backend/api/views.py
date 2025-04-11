import logging
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db import transaction
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import BeverageCategory, Beverage, Order, OrderItem
from .serializers import BeverageCategorySerializer, BeverageSerializer, OrderSerializer

# Set up logging
logger = logging.getLogger(__name__)

# ----------------------------- BEVERAGE VIEWS -----------------------------

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow public access
def get_categories(request):
    try:
        categories = BeverageCategory.objects.all()
        serializer = BeverageCategorySerializer(categories, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching beverage categories: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow public access
def get_beverages(request):
    try:
        beverages = Beverage.objects.all()
        serializer = BeverageSerializer(beverages, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching beverages: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ----------------------------- AUTHENTICATION FUNCTIONS -----------------------------

@api_view(["POST"])
def register_user(request):
    try:
        username = request.data.get("username")
        password = request.data.get("password")

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def login_user(request):
    try:
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            })
        else:
            return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f"Error logging in user: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def logout_user(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error logging out: {str(e)}")
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

# ----------------------------- ORDER FUNCTIONS -----------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    try:
        items = request.data.get("items")

        # Ensure that 'items' is a list
        if not isinstance(items, list) or not items:
            return Response({"error": "No items provided or invalid format."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        order_items = []

        # Start transaction block for atomic operations
        with transaction.atomic():
            order = Order(user=user)
            order.save()

            # Loop through the items and create order items
            for item in items:
                beverage_id = item.get("id")
                quantity = item.get("quantity", 1)

                if not beverage_id or quantity <= 0:
                    return Response({"error": "Invalid item data."}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    beverage = Beverage.objects.get(id=beverage_id)
                except Beverage.DoesNotExist:
                    return Response({"error": f"Beverage with ID {beverage_id} does not exist."}, status=status.HTTP_400_BAD_REQUEST)

                # Calculate item total price
                item_total = beverage.price * quantity

                # Create the OrderItem instance
                OrderItem.objects.create(
                    order=order,
                    beverage=beverage,
                    quantity=quantity,
                    price=beverage.price
                )

                # Append order item data to the response
                order_items.append({
                    "name": beverage.name,
                    "quantity": quantity,
                    "total_price": item_total
                })

            # Total price will be automatically calculated via the `total_price` property in the Order model
            order.save()

        # Return the response with order details
        return Response({
            "message": "Order placed successfully",
            "order_items": order_items,
            "total_price": order.total_price,
        })

    except Exception as e:
        logger.error(f"Error placing order: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ----------------------------- GET USER ORDERS -----------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    try:
        # Get orders for the authenticated user
        orders = Order.objects.filter(user=request.user)

        # Serialize the orders
        serialized_orders = OrderSerializer(orders, many=True)

        # Return the serialized data
        return Response(serialized_orders.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching user orders: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)