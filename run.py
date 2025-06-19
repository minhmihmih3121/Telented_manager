from waitress import serve
try:
    from app import create_app
except Exception as e:
    print("Import lỗi:", e)
    raise

app = create_app()

if __name__ == "__main__":
    print("Server running on http://localhost:8000")
    serve(app, host="0.0.0.0", port=8000)