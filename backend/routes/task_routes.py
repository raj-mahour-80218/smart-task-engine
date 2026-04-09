from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from extensions import db
from models.task import Task
from services.task_service import TaskService
from schemas.task_schema import TaskSchema

task_bp = Blueprint('tasks', __name__)
schema = TaskSchema()

@task_bp.route('/', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify(schema.dump(tasks, many=True))

@task_bp.route('/', methods=['POST'])
def create_task():
    try:
        data = schema.load(request.json or {})
    except ValidationError as err:
        return jsonify({"errors": list(err.messages.values())}), 400
    task, errors = TaskService.create(data)
    if errors:
        return jsonify({"errors": errors}), 400
    return jsonify(schema.dump(task)), 201

@task_bp.route('/<int:id>', methods=['PUT'])
def update_task(id):
    task = Task.query.get_or_404(id)
    try:
        data = schema.load(request.json or {}, partial=True)
    except ValidationError as err:
        return jsonify({"errors": list(err.messages.values())}), 400
    task, errors = TaskService.update(task, data)
    if errors:
        return jsonify({"errors": errors}), 400
    return jsonify(schema.dump(task))

@task_bp.route('/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return '', 204