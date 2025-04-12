import React, { useState, useEffect, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { processApi } from "../api/processApi";
import { Process, ProcessStatus } from "../types";
import Button from "../components/Button";
import Card from "../components/Card";

// Inline styles since Tailwind isn't applying correctly
const styles: Record<string, CSSProperties> = {
  pageContainer: {
    width: "100%",
  },
  headerContainer: {
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
  errorMessage: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    color: "#b91c1c",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "2rem 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gap: "1rem",
  },
  cardContent: {
    padding: "1rem",
    backgroundColor: "white",
    transition: "box-shadow 0.3s",
    textAlign: "left",
  },
  cardInner: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#111827",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  badge: {
    padding: "0.25rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  cardStats: {
    fontSize: "0.875rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  statText: {
    color: "#4b5563",
  },
  statLabel: {
    fontWeight: "500",
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  },
};

// Media query for responsive grid
if (typeof window !== "undefined") {
  if (window.matchMedia("(min-width: 768px)").matches) {
    styles.grid = {
      ...styles.grid,
      gridTemplateColumns: "repeat(2, 1fr)",
    };
  }
  if (window.matchMedia("(min-width: 1024px)").matches) {
    styles.grid = {
      ...styles.grid,
      gridTemplateColumns: "repeat(3, 1fr)",
    };
  }
}

const ProcessListPage: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const data = await processApi.getAllProcesses();
        setProcesses(data);
      } catch {
        setError("Failed to load processes");
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

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

  return (
    <div style={styles.pageContainer}>
      <div style={styles.headerContainer}>
        <h1 style={styles.title}>Processes</h1>
        <Button
          label="Create New Process"
          onClick={() => navigate("/processes/create")}
          variant="primary"
          className="text-sm"
        />
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div style={styles.loadingContainer}>Loading...</div>
      ) : (
        <div style={styles.grid}>
          {processes.map((process) => (
            <Card key={process.id}>
              <div
                style={styles.cardContent}
                onMouseOver={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)")
                }
                onMouseOut={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={styles.cardInner}>
                  <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>
                      Process #{process.id.slice(0, 8)}
                    </h2>
                    <span
                      style={{
                        ...styles.badge,
                        ...getStatusColor(process.status),
                      }}
                    >
                      {process.status}
                    </span>
                  </div>
                  <div style={styles.cardStats}>
                    <p style={styles.statText}>
                      <span style={styles.statLabel}>Items:</span>{" "}
                      {process.itemsToProcess.length}
                    </p>
                    <p style={styles.statText}>
                      <span style={styles.statLabel}>Processed:</span>{" "}
                      {process.processedItems.length}
                    </p>
                  </div>
                  <div style={styles.cardActions}>
                    <Button
                      label="View Details"
                      onClick={() => navigate(`/processes/${process.id}`)}
                      variant="secondary"
                      className="text-xs py-1 px-3"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessListPage;
