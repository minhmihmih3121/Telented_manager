from flask import Blueprint, render_template
from app import db
from sqlalchemy import text


main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route("/test-db")
def test_db():
    try:
        db.session.execute(text('SELECT 1'))
        return "✅ Kết nối DB thành công"
    except Exception as e:
        return f"❌ Kết nối DB thất bại: {e}"