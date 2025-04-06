import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { processApi } from "../api/processApi";
import { Process } from "../types/process";
import { ProcessCard } from "../components/ProcessCard";
import { Button } from "../components/Button";

export const ProcessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProcess = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await processApi.getProcessById(id);
      setProcess(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch process");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcess();
  }, [id]);

  const handleStartProcess = async () => {
    if (!id) return;

    try {
      setActionLoading(true);
      const result = await processApi.startProcess(id);
      if (result.success) {
        setSuccessMessage(result.message);
        fetchProcess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to start process");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelProcess = async (revert: boolean) => {
    if (!id) return;

    try {
      setActionLoading(true);
      const result = await processApi.cancelProcess(id, revert);
      if (result.success) {
        setSuccessMessage(result.message);
        fetchProcess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to cancel process");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessItem = async () => {
    if (!id) return;

    try {
      setActionLoading(true);
      const result = await processApi.processItem(id);
      if (result.success) {
        setSuccessMessage(result.message);
        fetchProcess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to process item");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <Button
          label="Back to List"
          onClick={() => navigate("/")}
          variant="secondary"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200"></div>
          <p className="mt-2">Loading process...</p>
        </div>
      ) : process ? (
        <ProcessCard
          process={process}
          onStart={handleStartProcess}
          onCancel={handleCancelProcess}
          onProcessItem={handleProcessItem}
          loading={actionLoading}
        />
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Process not found.</p>
          <Button
            label="Back to List"
            onClick={() => navigate("/")}
            variant="primary"
          />
        </div>
      )}
    </div>
  );
};
