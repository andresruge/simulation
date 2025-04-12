import React, { useEffect } from "react";
import { Process, ProcessStatus } from "../types/process";
import Card from "./Card"; // Corrected import
import Button from "./Button"; // Corrected import
import { ProgressBar } from "./ProgressBar";

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
  const getStatusColor = (): string => {
    switch (process.status) {
      case ProcessStatus.NotStarted:
        return "bg-gray-500";
      case ProcessStatus.Running:
        return "bg-blue-500";
      case ProcessStatus.Completed:
        return "bg-green-500";
      case ProcessStatus.Cancelled:
      case ProcessStatus.CancelledWithRevert:
      case ProcessStatus.RevertFailed:
        return "bg-red-500";
      default:
        return "bg-gray-500";
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
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <span
            className={`px-2 py-1 text-white text-sm rounded-full ${getStatusColor()}`}
          >
            {process.status?.toString()}
          </span>
        </div>

        <div>
          <span className="font-medium">Progress:</span>
          <div className="mt-1">
            <ProgressBar progress={progressPercentage} />
            <div className="text-right text-sm mt-1">
              {process.processedItems.length} / {process.items.length} items (
              {progressPercentage}%)
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-1">Items</h4>
          <div className="flex flex-wrap gap-1">
            {process.items.map((item) => (
              <span
                key={item}
                className={`px-2 py-1 text-sm rounded-full ${
                  process.processedItems.includes(item)
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-1">Processed Items</h4>
          {process.processedItems.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {process.processedItems.map((item) => (
                <span
                  key={item}
                  className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No items have been processed yet.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
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
