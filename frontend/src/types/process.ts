export enum ProcessStatus {
  NotStarted = "NotStarted",
  Running = "Running",
  Completed = "Completed",
  Cancelled = "Cancelled",
  CancelledWithRevert = "CancelledWithRevert",
  RevertFailed = "RevertFailed",
}

export interface Process {
  id: string;
  status: ProcessStatus;
  items: number[];
  processedItems: number[];
}

export interface CreateProcessRequest {
  items: number[];
}

export interface CreateProcessResponse {
  id: string;
}

export interface ProcessActionResponse {
  success: boolean;
  message: string;
  processedItem?: number;
}
