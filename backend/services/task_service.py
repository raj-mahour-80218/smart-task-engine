from models.task import Task
from extensions import db
from rules.task_rules import RULES

class TaskService:

    @staticmethod
    def apply_rules(data, existing_task=None, is_update=False):
        errors = []

        context = {
            "data": data,
            "existing": existing_task
        }

        for rule in RULES:
            errors.extend(rule.validate(context, is_update))

        return errors

    @staticmethod
    def create(data):
        errors = TaskService.apply_rules(data)
        if errors:
            return None, errors

        task = Task(**data)
        db.session.add(task)
        db.session.commit()
        return task, None

    @staticmethod
    def update(task, data):
        errors = TaskService.apply_rules(data, task, True)
        if errors:
            return None, errors

        for key, value in data.items():
            setattr(task, key, value)

        db.session.commit()
        return task, None