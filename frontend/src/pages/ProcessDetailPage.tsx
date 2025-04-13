import { useState, useEffect, useCallback, CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { processApi } from "../api/processApi";
import { Process, ProcessStatus } from "../types";
import Button from "../components/Button";

// Inline styles since Tailwind isn't applying correctly
const styles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
    margin: "1rem auto",
    padding: "2.5rem", // Equivalent to p-10
  },
  headerSection: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "1rem",
    gap: "1rem",
  },
  headerTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "0.5rem",
    textAlign: "left" as const,
  },
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  itemsSection: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1.5rem",
    marginTop: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: "500",
    color: "#111827",
    marginBottom: "0.75rem",
    textAlign: "left" as const,
  },
  itemsBox: {
    borderRadius: "0.5rem",
    padding: "2rem",
  },
  itemsToProcessBox: {
    backgroundColor: "#f9fafb",
  },
  processedItemsBox: {
    backgroundColor: "#ecfdf5",
  },
  itemText: {
    fontSize: "0.875rem",
  },
  actionsSection: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.75rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e5e7eb",
    marginTop: "1.5rem",
  },
  noItemsText: {
    color: "#6b7280",
    fontSize: "0.875rem",
    fontStyle: "italic",
  },
};

export default function ProcessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProcess = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await processApi.getProcessById(id);
      setProcess(data);
      setError(null);
    } catch {
      setError("Failed to load process");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProcess();
  }, [fetchProcess]);

  const handleStartProcess = async () => {
    if (!id) return;

    try {
      await processApi.startProcess(id);
      setSuccessMessage("Process started successfully");
      fetchProcess();
    } catch {
      setError("Failed to start process");
    }
  };

  const handleCancelProcess = async (revert: boolean) => {
    if (!id) return;

    try {
      await processApi.cancelProcess(id, revert);
      setSuccessMessage(
        revert ? "Process cancelled and reverted" : "Process cancelled"
      );
      fetchProcess();
    } catch {
      setError("Failed to cancel process");
    }
  };

  const handleProcessItem = async () => {
    if (!id) return;

    try {
      await processApi.processItem(id);
      setSuccessMessage("Item processed successfully");
      fetchProcess();
    } catch {
      setError("Failed to process item");
    }
  };

  const getStatusColor = (status: ProcessStatus) => {
    switch (status) {
      case ProcessStatus.NotStarted:
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case ProcessStatus.Running:
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case ProcessStatus.Completed:
        return { backgroundColor: "#d1fae5", color: "#065f46" };
      case ProcessStatus.Cancelled:
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case ProcessStatus.CancelledWithRevert:
        return { backgroundColor: "#ffedd5", color: "#9a3412" };
      case ProcessStatus.RevertFailed:
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  if (loading) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}
          >
            Process Details
          </h1>
          <Button
            label="Back to List"
            onClick={() => navigate("/")}
            variant="secondary"
            className="text-sm"
          />
        </div>
        <div style={{ textAlign: "center", padding: "2rem 0" }}>Loading...</div>
      </div>
    );
  }

  if (!process) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}
          >
            Process Details
          </h1>
          <Button
            label="Back to List"
            onClick={() => navigate("/")}
            variant="secondary"
            className="text-sm"
          />
        </div>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            padding: "1.5rem",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Process not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}
        >
          Process Details
        </h1>
        <Button
          label="Back to List"
          onClick={() => navigate("/")}
          variant="secondary"
          className="text-sm"
        />
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            color: "#b91c1c",
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #dcfce7",
            color: "#166534",
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {successMessage}
        </div>
      )}

      <div style={styles.card}>
        <div style={{ textAlign: "left" }}>
          {/* Header Section */}
          <div style={styles.headerSection}>
            <div style={{ textAlign: "left" }}>
              <h2 style={styles.headerTitle}>Process #{process.id}</h2>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                  Status:{" "}
                </span>
                &nbsp;
                <span
                  style={{
                    ...styles.statusBadge,
                    ...getStatusColor(process.status),
                  }}
                >
                  {process.status}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                Total Items: {process.itemsToProcess.length}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                Processed: {process.processedItems.length}
              </div>
            </div>
          </div>

          {/* Items Sections */}
          <div style={styles.itemsSection}>
            <div style={{ textAlign: "left" }}>
              <h3 style={styles.sectionTitle}>Items to Process</h3>
              <div
                style={{
                  ...styles.itemsBox,
                  ...styles.itemsToProcessBox,
                  textAlign: "left",
                }}
              >
                {process.itemsToProcess.length > 0 ? (
                  <p style={{ ...styles.itemText, color: "#374151" }}>
                    {process.itemsToProcess.join(", ")}
                  </p>
                ) : (
                  <p style={styles.noItemsText}>No items to process</p>
                )}
              </div>
            </div>

            <div style={{ textAlign: "left" }}>
              <h3 style={styles.sectionTitle}>Processed Items</h3>
              <div
                style={{
                  ...styles.itemsBox,
                  ...styles.processedItemsBox,
                  textAlign: "left",
                }}
              >
                {process.processedItems.length > 0 ? (
                  <p style={{ ...styles.itemText, color: "#065f46" }}>
                    {process.processedItems.join(", ")}
                  </p>
                ) : (
                  <p style={styles.noItemsText}>No processed items</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div style={styles.actionsSection}>
            {process.status === ProcessStatus.NotStarted && (
              <Button
                label="Start Process"
                onClick={handleStartProcess}
                variant="primary"
                className="text-sm"
              />
            )}
            {process.status === ProcessStatus.Running && (
              <>
                <Button
                  label="Process Next Item"
                  onClick={handleProcessItem}
                  variant="primary"
                  className="text-sm"
                />
                <Button
                  label="Cancel Process"
                  onClick={() => handleCancelProcess(false)}
                  variant="danger"
                  className="text-sm"
                />
                <Button
                  label="Cancel & Revert"
                  onClick={() => handleCancelProcess(true)}
                  variant="secondary"
                  className="text-sm"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
