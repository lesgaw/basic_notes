'use client'

import { useState } from "react";
import { createTag, updateTag } from "@/app/actions/tags";

interface TagFormProps {
  tag?: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
}

export function TagForm({ tag, onSuccess }: TagFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (tag) {
      await updateTag(formData);
    } else {
      await createTag(formData);
    }
    setIsOpen(false);
    onSuccess?.();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {tag ? "Edit Tag" : "Create Tag"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {tag ? "Edit Tag" : "Create Tag"}
            </h2>
            <form action={handleSubmit}>
              <input type="hidden" name="id" value={tag?.id} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={tag?.name}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {tag ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 