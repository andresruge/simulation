import React, { useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { processApi } from "../api/processApi";
import { CreateProcessForm } from "../components/CreateProcessForm";
import Button from "../components/Button";

// Page styles
const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#111827",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    padding: "1.5rem",
    maxWidth: "32rem",
    margin: "0 auto",
  },
  error: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    color: "#b91c1c",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  success: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #dcfce7",
    color: "#166534",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
};

const ProcessCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateProcess = async (items: number[]) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const process = await processApi.createProcess(items);
      setSuccess("Process created successfully!");

      // Navigate to the newly created process detail page after a short delay
      setTimeout(() => {
        navigate(`/processes/${process.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error creating process:", error);
      setError("Failed to create process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create New Process</h1>
        <Button
          label="Back to List"
          onClick={() => navigate("/")}
          variant="secondary"
          className="text-sm"
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.formContainer}>
        <CreateProcessForm onSubmit={handleCreateProcess} loading={loading} />
      </div>
    </div>
  );
};

export default ProcessCreatePage;
