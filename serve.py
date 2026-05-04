import os, http.server, socketserver

port = int(os.environ.get("PORT", 3457))
handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", port), handler) as httpd:
    print(f"Serving on http://localhost:{port}", flush=True)
    httpd.serve_forever()
