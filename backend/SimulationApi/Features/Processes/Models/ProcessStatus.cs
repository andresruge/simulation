namespace SimulationApi.Features.Processes.Models;

public enum ProcessStatus
{
    NotStarted,
    Running,
    Completed,
    Failed, // Added Failed status
    Cancelled,
    CancelledWithRevert,
    RevertFailed
}
