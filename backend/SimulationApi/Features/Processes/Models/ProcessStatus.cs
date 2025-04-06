namespace SimulationApi.Features.Processes.Models;

public enum ProcessStatus
{
    NotStarted,
    Running,
    Completed,
    Cancelled,
    CancelledWithRevert,
    RevertFailed
} 