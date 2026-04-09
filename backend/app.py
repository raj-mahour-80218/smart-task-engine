from flask import Flask
from extensions import db
from routes.task_routes import task_bp
from routes.ai_routes import ai_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    app.register_blueprint(task_bp, url_prefix='/tasks')
    app.register_blueprint(ai_bp, url_prefix='/ai')

    # ✅ Auto-create tables on startup
    with app.app_context():
        db.create_all()

    return app


app = create_app()
CORS(app)

if __name__ == '__main__':
    app.run(debug=True)