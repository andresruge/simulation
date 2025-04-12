import React, { CSSProperties } from "react";
import { Process, ProcessStatus } from "../types/process";
import Card from "./Card"; // Corrected import
import Button from "./Button"; // Corrected import
import { ProgressBar } from "./ProgressBar";

// Inline styles
const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1.5rem",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  label: {
    fontWeight: "500",
  },
  badge: {
    padding: "0.25rem 0.5rem",
    color: "white",
    fontSize: "0.875rem",
    borderRadius: "9999px",
  },
  progressContainer: {
    marginTop: "0.25rem",
  },
  progressInfo: {
    textAlign: "right",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  },
  sectionTitle: {
    fontWeight: "500",
    marginBottom: "0.25rem",
  },
  itemsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem",
  },
  itemBadge: {
    padding: "0.25rem 0.5rem",
    fontSize: "0.875rem",
    borderRadius: "9999px",
  },
  itemProcessed: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  itemPending: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
  },
  noItemsText: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  actionsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    paddingTop: "0.5rem",
  },
};

interface ProcessCardProps {
  process: Process;
  onStart?: () => void;
  onCancel?: (revert: boolean) => void;
  onProcessItem?: () => void;
  loading?: boolean;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({
  process,
  onStart,
  onCancel,
  onProcessItem,
  loading = false,
}) => {
  const getStatusColor = (): CSSProperties => {
    switch (process.status) {
      case ProcessStatus.NotStarted:
        return { backgroundColor: "#6b7280" };
      case ProcessStatus.Running:
        return { backgroundColor: "#3b82f6" };
      case ProcessStatus.Completed:
        return { backgroundColor: "#10b981" };
      case ProcessStatus.Cancelled:
      case ProcessStatus.CancelledWithRevert:
      case ProcessStatus.RevertFailed:
        return { backgroundColor: "#ef4444" };
      default:
        return { backgroundColor: "#6b7280" };
    }
  };

  // Simplified status check function
  const checkStatus = (expectedStatus: ProcessStatus): boolean => {
    // Direct comparison (works for both string and numeric enums if type matches)
    if (process.status === expectedStatus) {
      return true;
    }

    // Fallback: Check if process.status is the numeric value corresponding to the enum member
    // This handles cases where the API sends a number but the enum is used for comparison.
    if (
      typeof process.status === "number" &&
      process.status === Number(expectedStatus)
    ) {
      return true;
    }

    // Fallback: Check if process.status is the string representation of the enum key
    // This handles cases where the API might send the enum key as a string ("Running")
    // This assumes ProcessStatus is a numeric enum where ProcessStatus[ProcessStatus.Running] === "Running"
    if (
      typeof process.status === "string" &&
      process.status === ProcessStatus[expectedStatus as number]
    ) {
      return true;
    }

    // Fallback: Check if process.status is the string representation of the numeric enum value
    // This handles cases where the API sends the numeric value as a string ("1")
    if (
      typeof process.status === "string" &&
      process.status === String(Number(expectedStatus))
    ) {
      return true;
    }

    return false;
  };

  const isRunning = checkStatus(ProcessStatus.Running);
  const isNotStarted = checkStatus(ProcessStatus.NotStarted);
  const isCompleted = checkStatus(ProcessStatus.Completed);
  const isCancelled = [
    ProcessStatus.Cancelled,
    ProcessStatus.CancelledWithRevert,
    ProcessStatus.RevertFailed,
  ].some((status) => checkStatus(status));

  const progressPercentage =
    process.items.length > 0
      ? Math.round((process.processedItems.length / process.items.length) * 100)
      : 0;

  return (
    <Card title={`Process: ${process.id}`}>
      <div style={styles.container}>
        <div style={styles.statusRow}>
          <span style={styles.label}>Status:</span>
          <span
            style={{
              ...styles.badge,
              ...getStatusColor(),
            }}
          >
            {process.status?.toString()}
          </span>
        </div>

        <div>
          <span style={styles.label}>Progress:</span>
          <div style={styles.progressContainer}>
            <ProgressBar progress={progressPercentage} />
            <div style={styles.progressInfo}>
              {process.processedItems.length} / {process.items.length} items (
              {progressPercentage}%)
            </div>
          </div>
        </div>

        <div>
          <h4 style={styles.sectionTitle}>Items</h4>
          <div style={styles.itemsContainer}>
            {process.items.map((item) => (
              <span
                key={item}
                style={{
                  ...styles.itemBadge,
                  ...(process.processedItems.includes(item)
                    ? styles.itemProcessed
                    : styles.itemPending),
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={styles.sectionTitle}>Processed Items</h4>
          {process.processedItems.length > 0 ? (
            <div style={styles.itemsContainer}>
              {process.processedItems.map((item) => (
                <span
                  key={item}
                  style={{ ...styles.itemBadge, ...styles.itemProcessed }}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p style={styles.noItemsText}>No items have been processed yet.</p>
          )}
        </div>

        <div style={styles.actionsContainer}>
          {/* Show button directly if not started */}
          {isNotStarted && onStart && (
            <Button
              label="Start Process"
              onClick={onStart}
              variant="primary"
              disabled={loading}
            />
          )}

          {/* Show button directly if running */}
          {isRunning && onProcessItem && (
            <Button
              label="Process Next Item"
              onClick={onProcessItem}
              variant="success"
              disabled={loading}
            />
          )}

          {/* Show cancel buttons if running */}
          {isRunning && onCancel && (
            <>
              <Button
                label="Cancel"
                onClick={() => onCancel(false)}
                variant="danger"
                disabled={loading}
              />
              <Button
                label="Cancel with Revert"
                onClick={() => onCancel(true)}
                variant="warning"
                disabled={loading}
              />
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
