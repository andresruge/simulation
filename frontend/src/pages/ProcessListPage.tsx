import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { processApi } from "../api/processApi";
import { Process, ProcessStatus } from "../types";
import Button from "../components/Button";
import Card from "../components/Card";

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
        return "bg-yellow-100 text-yellow-800";
      case ProcessStatus.Running:
        return "bg-blue-100 text-blue-800";
      case ProcessStatus.Completed:
        return "bg-green-100 text-green-800";
      case ProcessStatus.Cancelled:
        return "bg-red-100 text-red-800";
      case ProcessStatus.CancelledWithRevert:
        return "bg-orange-100 text-orange-800";
      case ProcessStatus.RevertFailed:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Processes</h1>
        <Button
          label="Create New Process"
          onClick={() => navigate("/processes/create")}
          variant="primary"
          className="text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processes.map((process) => (
            <Card key={process.id}>
              <div className="p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <h2 className="text-base font-semibold text-gray-900 truncate">
                      Process #{process.id.slice(0, 8)}
                    </h2>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        process.status
                      )}`}
                    >
                      {process.status}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600">
                      <span className="font-medium">Items:</span>{" "}
                      {process.itemsToProcess.length}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Processed:</span>{" "}
                      {process.processedItems.length}
                    </p>
                  </div>
                  <div className="flex justify-end mt-2">
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
