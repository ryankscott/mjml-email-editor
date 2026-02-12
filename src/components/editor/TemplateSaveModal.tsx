import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form id="template-save-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Spring promo email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-[90px]"
                placeholder="Quick summary for your team."
              />
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button variant="pillNeutral" size="pill" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="pillAccent" size="pill" type="submit" form="template-save-form">
            Save template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
