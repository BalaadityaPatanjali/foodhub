from django.contrib import admin
from django.urls import include, path

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", include("orders.urls")),
    path("admin/", admin.site.urls),
    path('tinymce/', include('tinymce.urls')),
]

# ✅ This ensures static files like pasta.jpg work in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
