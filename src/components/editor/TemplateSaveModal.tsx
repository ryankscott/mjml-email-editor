import { useState, type FormEvent } from "react";

import Modal from "./Modal";

export type TemplateSavePayload = {
  name: string;
  description?: string;
};

type TemplateSaveModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: TemplateSavePayload) => void;
};

export default function TemplateSaveModal({
  open,
  onClose,
  onSave,
}: TemplateSaveModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload: TemplateSavePayload = {
      name: name.trim(),
      description: description.trim() || undefined,
    };
    onSave(payload);
    setName("");
    setDescription("");
  };

  return (
    <Modal
      title="Save as Template"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="template-save-form"
            className="rounded-full border border-cyan-300 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100"
          >
            Save template
          </button>
        </div>
      }
    >
      <form
        id="template-save-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-2 text-xs text-slate-600">
          Template name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            placeholder="Spring promo email"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs text-slate-600">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[90px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            placeholder="Quick summary for your team."
          />
        </label>

      </form>
    </Modal>
  );
}
