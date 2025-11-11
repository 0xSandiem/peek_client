import os
import requests
from django.conf import settings
from django.http import HttpResponse, JsonResponse
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
            if request.FILES:
                files = {}
                for key, file_obj in request.FILES.items():
                    files[key] = (file_obj.name, file_obj.read())

                headers_cleaned = {k: v for k, v in headers.items() if k.lower() != 'content-type'}

                response = requests.post(
                    flask_url,
                    headers=headers_cleaned,
                    files=files,
                    timeout=30,
                )
            else:
                response = requests.post(
                    flask_url,
                    headers=headers,
                    data=request.body,
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
            "content-type",
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
        import traceback
        print(f"Proxy error: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"error": "Internal server error", "detail": str(e)}, status=500)


def serve_react(request, path=""):
    react_build_path = os.path.join(settings.BASE_DIR, "static", "react")

    if not os.path.exists(react_build_path):
        return HttpResponse(
            """
            <html>
            <head><title>Peek - Build Required</title></head>
            <body style="font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto;">
                <h1>🏗️ Build Required</h1>
                <p>The React frontend hasn't been built yet.</p>
                <h2>To build the frontend:</h2>
                <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
cd client
pnpm install
pnpm build</pre>
                <p>After building, refresh this page.</p>
                <hr>
                <p><strong>Current API Status:</strong></p>
                <ul>
                    <li>Django Proxy: ✓ Running on port 8000</li>
                    <li>Health Check: <a href="/health/">/health/</a></li>
                    <li>API Proxy: <a href="/api/health">/api/health</a></li>
                </ul>
            </body>
            </html>
            """,
            content_type="text/html",
        )

    if path.endswith("/") or not path:
        file_path = os.path.join(react_build_path, "index.html")
    else:
        file_path = os.path.join(react_build_path, path)
        if not os.path.exists(file_path):
            file_path = os.path.join(react_build_path, "index.html")

    try:
        with open(file_path, "rb") as f:
            content = f.read()

        content_type = "text/html"
        if file_path.endswith(".js"):
            content_type = "application/javascript"
        elif file_path.endswith(".css"):
            content_type = "text/css"
        elif file_path.endswith(".json"):
            content_type = "application/json"
        elif file_path.endswith(".png"):
            content_type = "image/png"
        elif file_path.endswith(".jpg") or file_path.endswith(".jpeg"):
            content_type = "image/jpeg"
        elif file_path.endswith(".svg"):
            content_type = "image/svg+xml"

        return HttpResponse(content, content_type=content_type)
    except FileNotFoundError:
        with open(os.path.join(react_build_path, "index.html"), "rb") as f:
            return HttpResponse(f.read(), content_type="text/html")
