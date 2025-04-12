import axios from "axios";
import { Process, ProcessStatus } from "../types";

// Make sure this matches your backend URL
const API_URL = "http://localhost:5000/api";

interface ApiProcess {
  id: string;
  status: number;
  items: string[];
  processedItems: string[];
  currentItemIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to normalize process data from API
function normalizeProcess(process: ApiProcess): Process {
  return {
    id: process.id,
    status: numberToProcessStatus(process.status),
    itemsToProcess: process.items || [],
    processedItems: process.processedItems || [],
    currentItemIndex: process.currentItemIndex || 0,
    createdAt: process.createdAt || new Date().toISOString(),
    updatedAt: process.updatedAt || new Date().toISOString(),
  };
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

export const processApi = {
  getAllProcesses: async (): Promise<Process[]> => {
    const response = await axios.get<ApiProcess[]>(`${API_URL}/processes`);
    const normalizedProcesses = response.data.map(normalizeProcess);
    return normalizedProcesses;
  },

  getProcessById: async (id: string): Promise<Process> => {
    const response = await axios.get<ApiProcess>(`${API_URL}/processes/${id}`);
    return normalizeProcess(response.data);
  },

  createProcess: async (items: number[]): Promise<Process> => {
    // Convert numbers to strings for the API
    const stringItems = items.map((item) => item.toString());
    const response = await axios.post<ApiProcess>(`${API_URL}/processes`, {
      items: stringItems,
    });
    return normalizeProcess(response.data);
  },

  startProcess: async (id: string): Promise<Process> => {
    const response = await axios.post<ApiProcess>(
      `${API_URL}/processes/${id}/start`
    );
    return normalizeProcess(response.data);
  },

  cancelProcess: async (id: string, revert: boolean): Promise<Process> => {
    const response = await axios.post<ApiProcess>(
      `${API_URL}/processes/${id}/cancel`,
      { revert }
    );
    return normalizeProcess(response.data);
  },

  processItem: async (id: string): Promise<Process> => {
    const response = await axios.post<ApiProcess>(
      `${API_URL}/processes/${id}/process-item`
    );
    return normalizeProcess(response.data);
  },
};
