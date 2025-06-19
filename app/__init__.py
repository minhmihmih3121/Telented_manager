import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Lấy thông tin kết nối từ biến môi trường
    db_user = os.getenv("DB_USERNAME")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_name = os.getenv("DB_NAME")
    db_port = os.getenv("DB_PORT", "3306")

    # Kiểm tra biến môi trường
    if not all([db_user, db_password, db_host, db_name]):
        raise ValueError("Thiếu thông tin cấu hình DB. Vui lòng kiểm tra biến môi trường.")

    # Cấu hình kết nối MySQL
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    
    try:
        from .routes.main_routes import main
    except Exception as e:
        print("Lỗi import blueprint:", e)
        raise
    app.register_blueprint(main)

    return app
