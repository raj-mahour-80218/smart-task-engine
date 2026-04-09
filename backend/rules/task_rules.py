from datetime import datetime
from rules.base_rule import BaseRule

class HighPriorityDeadlineRule(BaseRule):
    def validate(self, task, is_update=False):
        if task.get('priority') == 'HIGH' and not task.get('deadline'):
            return ["Deadline is required for high priority tasks"]
        return []

class CompletedTaskImmutableRule(BaseRule):
    def validate(self, context, is_update=False):
        existing = context.get("existing")

        if is_update and existing and existing.status == "DONE":
            return ["Completed tasks cannot be updated"]

        return []

class OverdueRule(BaseRule):
    def validate(self, task, is_update=False):
        if task.get('deadline'):
            if datetime.fromisoformat(task['deadline']) < datetime.utcnow():
                task['status'] = 'OVERDUE'
        return []

RULES = [
    HighPriorityDeadlineRule(),
    CompletedTaskImmutableRule(),
    OverdueRule()
]