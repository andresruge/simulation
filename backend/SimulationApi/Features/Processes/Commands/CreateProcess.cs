using MongoDB.Driver;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Models;

namespace SimulationApi.Features.Processes.Commands;

public static class CreateProcess
{
    public record Command(List<int> Items);

    public record Result(string Id);

    public class Handler
    {
        private readonly MongoDbContext _context;

        public Handler(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<Result> HandleAsync(Command command)
        {
            var process = new Process
            {
                Id = Guid.NewGuid().ToString(),
                Status = ProcessStatus.NotStarted,
                Items = command.Items,
                ProcessedItems = []
            };

            await _context.Processes.InsertOneAsync(process);

            return new Result(process.Id);
        }
    }
} 