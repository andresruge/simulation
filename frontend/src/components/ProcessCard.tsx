import React, { useEffect } from "react";
import { Process, ProcessStatus } from "../types/process";
import { Card } from "./Card";
import { Button } from "./Button";
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
  // Add debug logging when component renders
  useEffect(() => {
    console.log("ProcessCard rendering with process:", process);
    console.log("Process status type:", typeof process.status);
    console.log("Process status value:", process.status);
    console.log("Is NotStarted?", process.status === ProcessStatus.NotStarted);
    console.log("Is Running?", process.status === ProcessStatus.Running);
    console.log("Available actions:", { onStart, onCancel, onProcessItem });
  }, [process, onStart, onCancel, onProcessItem]);

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

  // Handle status comparison with a fallback to numeric comparison
  const checkStatus = (expectedStatus: ProcessStatus): boolean => {
    try {
      // First try direct comparison
      if (process.status === expectedStatus) {
        return true;
      }

      // Check if we're dealing with a numeric status that hasn't been converted
      if (typeof process.status === "number") {
        // Map the enum values to their numeric equivalents
        const statusMap = {
          [ProcessStatus.NotStarted]: 0,
          [ProcessStatus.Running]: 1,
          [ProcessStatus.Completed]: 2,
          [ProcessStatus.Cancelled]: 3,
          [ProcessStatus.CancelledWithRevert]: 4,
          [ProcessStatus.RevertFailed]: 5,
        };

        // Compare the numeric values directly
        return process.status === statusMap[expectedStatus];
      }

      // Then try string comparison
      if (
        typeof process.status === "string" &&
        process.status === expectedStatus.toString()
      ) {
        return true;
      }

      // Then try comparing the string representation
      if (process.status?.toString() === expectedStatus.toString()) {
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error comparing status:", err);
      return false;
    }
  };

  const isRunning = checkStatus(ProcessStatus.Running);
  const isNotStarted = checkStatus(ProcessStatus.NotStarted);
  const isCompleted = checkStatus(ProcessStatus.Completed);
  const isCancelled = [
    ProcessStatus.Cancelled,
    ProcessStatus.CancelledWithRevert,
    ProcessStatus.RevertFailed,
  ].some((status) => checkStatus(status));

  console.log("Status flags:", {
    isNotStarted,
    isRunning,
    isCompleted,
    isCancelled,
  });

  const progressPercentage =
    process.items.length > 0
      ? Math.round((process.processedItems.length / process.items.length) * 100)
      : 0;

  return (
    <Card title={`Process: ${process.id}`}>
      <div className="space-y-4">
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

          {/* Debug section - always visible for troubleshooting */}
          <div className="w-full mt-4 p-3 bg-gray-100 rounded-md">
            <h4 className="text-xs font-bold mb-1">Debug Info:</h4>
            <div className="text-xs">
              <div>
                Status: {process.status?.toString()} (type:{" "}
                {typeof process.status})
              </div>
              <div>isNotStarted: {isNotStarted ? "true" : "false"}</div>
              <div>isRunning: {isRunning ? "true" : "false"}</div>
              <div>isCompleted: {isCompleted ? "true" : "false"}</div>
              <div>isCancelled: {isCancelled ? "true" : "false"}</div>
              <div>
                Handlers available:
                {onStart ? " onStart" : ""}
                {onCancel ? " onCancel" : ""}
                {onProcessItem ? " onProcessItem" : ""}
              </div>
            </div>
          </div>

          {/* Emergency Actions - Always visible regardless of status */}
          <div className="w-full mt-4 p-3 bg-yellow-100 rounded-md">
            <h4 className="text-xs font-bold mb-1">Emergency Actions:</h4>
            <div className="flex flex-wrap gap-2">
              {onStart && (
                <button
                  onClick={onStart}
                  className="text-xs bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                  disabled={loading}
                >
                  Force Start
                </button>
              )}
              {onProcessItem && (
                <button
                  onClick={onProcessItem}
                  className="text-xs bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded"
                  disabled={loading}
                >
                  Force Process Item
                </button>
              )}
              {onCancel && (
                <>
                  <button
                    onClick={() => onCancel(false)}
                    className="text-xs bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded"
                    disabled={loading}
                  >
                    Force Cancel
                  </button>
                  <button
                    onClick={() => onCancel(true)}
                    className="text-xs bg-orange-500 hover:bg-orange-700 text-white py-1 px-2 rounded"
                    disabled={loading}
                  >
                    Force Cancel w/ Revert
                  </button>
                </>
              )}
            </div>
            <p className="text-xs mt-2 text-gray-700">
              Use these actions if the normal buttons aren't appearing.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
