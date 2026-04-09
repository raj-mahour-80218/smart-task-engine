from flask import Blueprint, request, jsonify

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/suggest', methods=['POST'])
def suggest():
    data = request.json
    title = data.get('title', '')

    return jsonify({
        "suggested_title": title.capitalize(),
        "suggestion": "Consider adding a deadline or priority"
    })