"""
SpendSense — Personal Finance Intelligence Platform
Flask REST API Entrypoint
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes.upload_routes import upload_bp
from routes.transaction_routes import transaction_bp
from routes.analytics_routes import analytics_bp
from routes.insight_routes import insight_bp
from routes.budget_routes import budget_bp
from routes.report_routes import report_bp


def create_app():
    app = Flask(__name__)

    # Configure CORS for all origins, supporting local development and frontend Vite proxy
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register API blueprints
    app.register_blueprint(upload_bp)
    app.register_blueprint(transaction_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(insight_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(report_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "SpendSense Financial Intelligence API",
            "version": "1.0.0",
        })

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "Resource not found", "code": 404}), 404

    @app.errorhandler(500)
    def handle_internal_error(e):
        return jsonify({"error": "Internal server error occurred", "code": 500}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting SpendSense API server on http://127.0.0.1:{port}...")
    app.run(host="127.0.0.1", port=port, debug=True)
