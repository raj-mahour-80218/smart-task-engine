from marshmallow import Schema, fields, validate

class TaskSchema(Schema):
    id          = fields.Int(dump_only=True)
    title       = fields.Str(required=True)
    description = fields.Str(load_default=None)
    priority    = fields.Str(validate=validate.OneOf(["LOW", "MEDIUM", "HIGH"]), load_default="LOW")
    status      = fields.Str(validate=validate.OneOf(["TODO", "IN_PROGRESS", "DONE"]), load_default="TODO")
    deadline    = fields.DateTime(allow_none=True, load_default=None, format="iso")
    created_at  = fields.DateTime(dump_only=True)