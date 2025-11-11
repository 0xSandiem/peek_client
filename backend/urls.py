from django.urls import path, re_path

from backend.views import health_check, proxy_to_flask, serve_react

urlpatterns = [
    path("health/", health_check, name="health"),
    re_path(r"^api/(?P<path>.*)$", proxy_to_flask, name="proxy"),
    re_path(r"^.*$", serve_react, name="react"),
]
