import requests
from django.conf import settings
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt


def health_check(request):
    return JsonResponse({"status": "ok", "service": "peek_client"})


@csrf_exempt
def proxy_to_flask(request, path):
    try:
        flask_url = f"{settings.FLASK_API_URL}/api/{path}"

        headers = {}
        for key, value in request.headers.items():
            if key.lower() not in ["host", "connection"]:
                headers[key] = value

        method = request.method.lower()

        if method == "get":
            response = requests.get(
                flask_url,
                headers=headers,
                params=request.GET,
                timeout=30,
            )
        elif method == "post":
            response = requests.post(
                flask_url,
                headers=headers,
                data=request.body,
                files=request.FILES if request.FILES else None,
                timeout=30,
            )
        elif method == "put":
            response = requests.put(
                flask_url,
                headers=headers,
                data=request.body,
                timeout=30,
            )
        elif method == "delete":
            response = requests.delete(
                flask_url,
                headers=headers,
                timeout=30,
            )
        else:
            return JsonResponse({"error": "Method not allowed"}, status=405)

        excluded_headers = [
            "content-encoding",
            "content-length",
            "transfer-encoding",
            "connection",
        ]
        response_headers = {
            key: value
            for key, value in response.headers.items()
            if key.lower() not in excluded_headers
        }

        if "image" in response.headers.get("content-type", ""):
            return HttpResponse(
                response.content,
                status=response.status_code,
                content_type=response.headers.get("content-type"),
            )

        return JsonResponse(
            response.json() if response.headers.get("content-type") == "application/json" else {"data": response.text},
            status=response.status_code,
            headers=response_headers,
        )

    except requests.exceptions.Timeout:
        return JsonResponse({"error": "Request timeout"}, status=504)
    except requests.exceptions.ConnectionError:
        return JsonResponse({"error": "Cannot connect to API"}, status=503)
    except Exception as e:
        return JsonResponse({"error": "Internal server error"}, status=500)


def serve_react(request):
    try:
        with open(settings.BASE_DIR / "static" / "index.html", "r") as f:
            return HttpResponse(f.read(), content_type="text/html")
    except FileNotFoundError:
        return HttpResponse(
            "<html><body><h1>Peek Client</h1><p>React app will be placed here. Build your React app and place it in the static directory.</p></body></html>",
            content_type="text/html",
        )
