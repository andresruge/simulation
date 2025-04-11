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
  itemsToProcess: string[];
  processedItems: string[];
  currentItemIndex: number;
  createdAt: string;
  updatedAt: string;
}
