import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { processApi } from "../api/processApi";
import { Process, ProcessStatus } from "../types";
import Button from "../components/Button";

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

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Process Details</h1>
          <Button
            label="Back to List"
            onClick={() => navigate("/")}
            variant="secondary"
            className="text-sm"
          />
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Process Details</h1>
          <Button
            label="Back to List"
            onClick={() => navigate("/")}
            variant="secondary"
            className="text-sm"
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          Process not found
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Process Details</h1>
        <Button
          label="Back to List"
          onClick={() => navigate("/")}
          variant="secondary"
          className="text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4 text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b border-gray-200 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Process #{process.id}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status: </span>
                  &nbsp;
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      process.status
                    )}`}
                  >
                    {process.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Total Items: {process.itemsToProcess.length}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Processed: {process.processedItems.length}
                </div>
              </div>
            </div>

            {/* Items Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Items to Process
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {process.itemsToProcess.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {process.itemsToProcess.map((item, index) => (
                        <span
                          key={index}
                          className="inline-block px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No items to process
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Processed Items
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  {process.processedItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {process.processedItems.map((item, index) => (
                        <span
                          key={index}
                          className="inline-block px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No processed items
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
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
    </div>
  );
}
