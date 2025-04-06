import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { processApi } from "../api/processApi";
import { Process } from "../types/process";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { CreateProcessForm } from "../components/CreateProcessForm";

export const ProcessListPage: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const data = await processApi.getAllProcesses();
      setProcesses(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch processes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const handleCreateProcess = async (items: number[]) => {
    try {
      setLoading(true);
      await processApi.createProcess({ items });
      fetchProcesses();
      setShowCreateForm(false);
    } catch (err) {
      setError("Failed to create process");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Process Simulation</h1>
        <Button
          label={showCreateForm ? "Cancel" : "Create Process"}
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? "secondary" : "primary"}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6">
          <Card title="Create New Process">
            <CreateProcessForm
              onSubmit={handleCreateProcess}
              loading={loading}
            />
          </Card>
        </div>
      )}

      {loading && processes.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200"></div>
          <p className="mt-2">Loading processes...</p>
        </div>
      ) : processes.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No processes found.</p>
          {!showCreateForm && (
            <Button
              label="Create Process"
              onClick={() => setShowCreateForm(true)}
              variant="primary"
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processes.map((process) => (
            <Link
              to={`/process/${process.id}`}
              key={process.id}
              className="block transition-transform hover:scale-105"
            >
              <Card title={`Process: ${process.id.slice(0, 8)}...`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span>{process.status}</span>
                  </div>
                  <div>
                    <span className="font-medium">Items:</span>{" "}
                    {process.items.length}
                  </div>
                  <div>
                    <span className="font-medium">Processed:</span>{" "}
                    {process.processedItems.length}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
