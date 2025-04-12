import React, { useState, CSSProperties } from "react";
import Button from "../components/Button";

// Inline styles
const styles: Record<string, CSSProperties> = {
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.25rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    outline: "none",
  },
  inputFocus: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.25)",
  },
  errorMessage: {
    marginTop: "0.25rem",
    fontSize: "0.875rem",
    color: "#dc2626",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },
};

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
  const [isFocused, setIsFocused] = useState(false);

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
    <div style={styles.formContainer}>
      <div style={styles.formGroup}>
        <label htmlFor="items" style={styles.label}>
          Items (comma-separated numbers)
        </label>
        <input
          id="items"
          type="text"
          value={itemsInput}
          onChange={(e) => setItemsInput(e.target.value)}
          placeholder="1, 2, 3, 4, 5"
          style={{
            ...styles.input,
            ...(isFocused ? styles.inputFocus : {}),
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={loading}
        />
        {error && <p style={styles.errorMessage}>{error}</p>}
      </div>

      <div style={styles.actions}>
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
