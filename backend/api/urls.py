from django.urls import path

from .views import get_categories, get_beverages
from .views import register_user, login_user, logout_user
from .views import place_order, get_user_orders
urlpatterns = [
    path('categories/', get_categories, name='get_categories'),
    path('beverages/', get_beverages, name='get_beverages'),

    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'), 
    path('logout/', logout_user, name='logout_user'),

   
    path('place_order/', place_order, name='place_order'),  # Add the new place_order endpoint
    path('orders/', get_user_orders, name='get_user_orders'),
]



