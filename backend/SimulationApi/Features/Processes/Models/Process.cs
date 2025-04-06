namespace SimulationApi.Features.Processes.Models;

public record Process
{
    public string Id { get; set; } = string.Empty;
    public ProcessStatus Status { get; set; }
    public List<int> Items { get; set; } = [];
    public List<int> ProcessedItems { get; set; } = []; 
} 