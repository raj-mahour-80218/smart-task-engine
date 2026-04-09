import { useState, useEffect } from "react";
import api from "../services/api";

const EMPTY_FORM = {
  title:       "",
  description: "",
  priority:    "LOW",
  status:      "TODO",
  deadline:    "",
};

export default function TaskModal({ show, onClose, onSaved, task }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(task);

  /* Populate form when modal opens */
  useEffect(() => {
    if (!show) return;
    setErrors({});
    if (task) {
      setForm({
        title:       task.title       ?? "",
        description: task.description ?? "",
        priority:    task.priority    ?? "LOW",
        status:      task.status      ?? "TODO",
        /* deadline comes from API as ISO string; slice to "YYYY-MM-DDTHH:MM" for datetime-local */
        deadline:    task.deadline ? task.deadline.slice(0, 16) : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [show, task]);

  /* Generic field setter */
  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  /* Client-side validation */
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    return e;
  };

  const submit = async () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    const payload = {
      title:    form.title.trim(),
      priority: form.priority,
      status:   form.status,
    };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.deadline)           payload.deadline    = form.deadline;

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        await api.post("/tasks/", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.join(", ") || "Something went wrong.";
      setErrors({ _global: msg });
    } finally {
      setLoading(false);
    }
  };

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (show) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="form-icon modal-form-icon">
              {isEdit ? "\u270f\ufe0f" : "\u2795"}
            </div>
            <div>
              <h3>{isEdit ? "Edit Task" : "New Task"}</h3>
              <p className="modal-subtitle">
                {isEdit
                  ? "Update the details below and save."
                  : "Fill in the details to create a new task."}
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="modal-form">

            {/* Title — full width */}
            <div className="form-group modal-col-full">
              <label className="form-label">
                Title <span className="required-star">*</span>
              </label>
              <input
                className={`form-control${errors.title ? " form-control--error" : ""}`}
                placeholder="What needs to be done?"
                value={form.title}
                onChange={set("title")}
                autoFocus
              />
              {errors.title && (
                <span className="field-error">{errors.title}</span>
              )}
            </div>

            {/* Description — full width */}
            <div className="form-group modal-col-full">
              <label className="form-label">Description</label>
              <textarea
                className="form-control form-textarea"
                placeholder="Add more details about this task…"
                value={form.description}
                onChange={set("description")}
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={form.priority}
                onChange={set("priority")}
              >
                <option value="LOW">&#128994; Low</option>
                <option value="MEDIUM">&#128993; Medium</option>
                <option value="HIGH">&#128308; High</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={form.status}
                onChange={set("status")}
              >
                <option value="TODO">&#9744; To Do</option>
                <option value="IN_PROGRESS">&#9203; In Progress</option>
                <option value="DONE">&#10003; Done</option>
              </select>
            </div>

            {/* Deadline — full width */}
            <div className="form-group modal-col-full">
              <label className="form-label">Deadline</label>
              <input
                type="datetime-local"
                className="form-control"
                value={form.deadline}
                onChange={set("deadline")}
              />
              <span className="field-hint">Optional — leave blank for no deadline.</span>
            </div>

            {/* Global error */}
            {errors._global && (
              <div className="form-error modal-col-full">
                &#9888; {errors._global}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading
              ? isEdit ? "Saving\u2026" : "Adding\u2026"
              : isEdit ? "Save Changes" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
