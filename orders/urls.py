# orders/urls.py
from django.urls import path
from . import views

app_name = "orders"

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_request, name='login'),
    path('logout/', views.logout_request, name='logout'),
    path('register/', views.register, name='register'),
    path('pizza/', views.pizza, name='pizza'),
    path('pasta/', views.pasta, name='pasta'),
    path('salad/', views.salad, name='salad'),
    path('subs/', views.subs, name='subs'),
    path('dinner_platters/', views.dinner_platters, name='dinner_platters'),
    path('directions/', views.directions, name='directions'),
    path('hours/', views.hours, name='hours'),
    path('contact/', views.contact, name='contact'),
    path('cart/', views.cart, name='cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('view_orders/', views.view_orders, name='view_orders'),  # Make sure this line exists
    path('mark_order_as_delivered/', views.mark_order_as_delivered, name='mark_order_as_delivered'),
    path('save_cart/', views.save_cart, name='save_cart'),
    path('retrieve_saved_cart/', views.retrieve_saved_cart, name='retrieve_saved_cart'),
    path('check_superuser/', views.check_superuser, name='check_superuser'),
    path('info/', views.info_page, name='info_page'),
    path('mark_delivered/<int:id>/', views.mark_delivered, name='mark_delivered'),  # Also make sure this exists for the new template
]