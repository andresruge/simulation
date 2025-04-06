import axios from "axios";
import {
  CreateProcessRequest,
  CreateProcessResponse,
  Process,
  ProcessActionResponse,
  ProcessStatus,
} from "../types/process";

// Make sure this matches your backend URL
const API_URL = "http://localhost:5000/api";

// Helper to log API responses
const logResponse = (endpoint: string, data: any) => {
  console.log(`API Response from ${endpoint}:`, data);
  return data;
};

export const processApi = {
  getAllProcesses: async (): Promise<Process[]> => {
    const response = await axios.get<Process[]>(`${API_URL}/processes`);
    const processes = response.data.map((p) => normalizeProcess(p));
    console.log("All processes fetched:", processes);
    return processes;
  },

  getProcessById: async (id: string): Promise<Process> => {
    console.log(`Fetching process with ID: ${id}`);
    const response = await axios.get<Process>(`${API_URL}/processes/${id}`);
    console.log("Raw process data:", response.data);
    const normalizedProcess = normalizeProcess(response.data);
    console.log("Normalized process:", normalizedProcess);
    return normalizedProcess;
  },

  createProcess: async (
    request: CreateProcessRequest
  ): Promise<CreateProcessResponse> => {
    const response = await axios.post<CreateProcessResponse>(
      `${API_URL}/processes`,
      request
    );
    return logResponse("createProcess", response.data);
  },

  startProcess: async (id: string): Promise<ProcessActionResponse> => {
    const response = await axios.post<ProcessActionResponse>(
      `${API_URL}/processes/${id}/start`
    );
    return logResponse("startProcess", response.data);
  },

  cancelProcess: async (
    id: string,
    revert: boolean
  ): Promise<ProcessActionResponse> => {
    const response = await axios.post<ProcessActionResponse>(
      `${API_URL}/processes/${id}/cancel`,
      null,
      { params: { revert } }
    );
    return logResponse("cancelProcess", response.data);
  },

  processItem: async (id: string): Promise<ProcessActionResponse> => {
    const response = await axios.post<ProcessActionResponse>(
      `${API_URL}/processes/${id}/process-item`
    );
    return logResponse("processItem", response.data);
  },
};

// Helper function to ensure process status is an enum value
function normalizeProcess(process: any): Process {
  // Check if the process status is defined
  if (process.status !== undefined) {
    // Handle number status from backend
    if (typeof process.status === "number") {
      const statusNumber = process.status as number;
      console.log(`Converting status from number "${statusNumber}" to enum`);
      return {
        ...process,
        status: numberToProcessStatus(statusNumber),
      };
    }

    // Handle string status
    if (typeof process.status === "string") {
      const statusValue = process.status as string;
      console.log(`Converting status from string "${statusValue}" to enum`);
      return {
        ...process,
        status: stringToProcessStatus(statusValue),
      };
    }
  }

  return process;
}

// Convert number status from API to ProcessStatus enum
function numberToProcessStatus(status: number): ProcessStatus {
  switch (status) {
    case 0:
      return ProcessStatus.NotStarted;
    case 1:
      return ProcessStatus.Running;
    case 2:
      return ProcessStatus.Completed;
    case 3:
      return ProcessStatus.Cancelled;
    case 4:
      return ProcessStatus.CancelledWithRevert;
    case 5:
      return ProcessStatus.RevertFailed;
    default:
      console.warn(
        `Unknown numeric process status: ${status}, defaulting to NotStarted`
      );
      return ProcessStatus.NotStarted;
  }
}

// Convert string status from API to ProcessStatus enum
function stringToProcessStatus(status: string): ProcessStatus {
  switch (status) {
    case "NotStarted":
      return ProcessStatus.NotStarted;
    case "Running":
      return ProcessStatus.Running;
    case "Completed":
      return ProcessStatus.Completed;
    case "Cancelled":
      return ProcessStatus.Cancelled;
    case "CancelledWithRevert":
      return ProcessStatus.CancelledWithRevert;
    case "RevertFailed":
      return ProcessStatus.RevertFailed;
    default:
      console.warn(
        `Unknown process status: ${status}, defaulting to NotStarted`
      );
      return ProcessStatus.NotStarted;
  }
}
