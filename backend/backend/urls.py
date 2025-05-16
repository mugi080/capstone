from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from api.views import serve_react  # Make sure this view is defined

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('api.urls')),  # Your app-specific routes

    # Djoser built-in routes
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),

    # ✅ Catch-all route to serve React index.html for any other frontend route
    re_path(r'^(?!admin|api|auth).*$', serve_react),
]

# For serving media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
