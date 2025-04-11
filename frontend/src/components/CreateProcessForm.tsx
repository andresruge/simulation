import React, { useState } from "react";
import Button from "../components/Button";
import { processApi } from "../api/processApi";

interface CreateProcessFormProps {
  onSubmit: (items: number[]) => void;
  loading?: boolean;
}

export const CreateProcessForm: React.FC<CreateProcessFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [itemsInput, setItemsInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateProcess = () => {
    try {
      // Parse items from input (comma-separated numbers)
      const items = itemsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const num = parseInt(item, 10);
          if (isNaN(num)) {
            throw new Error(`Invalid number: ${item}`);
          }
          return num;
        });

      if (items.length === 0) {
        setError("Please enter at least one valid number");
        return;
      }

      onSubmit(items);
      setItemsInput("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="items"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Items (comma-separated numbers)
        </label>
        <input
          id="items"
          type="text"
          value={itemsInput}
          onChange={(e) => setItemsInput(e.target.value)}
          placeholder="1, 2, 3, 4, 5"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex justify-end">
        <Button
          label="Create Process"
          onClick={handleCreateProcess}
          disabled={loading || !itemsInput.trim()}
          variant="primary"
        />
      </div>
    </div>
  );
};
