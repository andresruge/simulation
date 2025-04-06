using MongoDB.Driver;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Models;

namespace SimulationApi.Features.Processes.Commands;

public static class StartProcess
{
    public record Command(string Id);

    public record Result(bool Success, string Message);

    public class Handler
    {
        private readonly MongoDbContext _context;

        public Handler(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<Result> HandleAsync(Command command)
        {
            var filter = Builders<Process>.Filter.Eq(p => p.Id, command.Id);
            var process = await _context.Processes.Find(filter).FirstOrDefaultAsync();

            if (process == null)
            {
                return new Result(false, "Process not found");
            }

            if (process.Status != ProcessStatus.NotStarted)
            {
                return new Result(false, $"Cannot start process with status {process.Status}");
            }

            var update = Builders<Process>.Update.Set(p => p.Status, ProcessStatus.Running);
            await _context.Processes.UpdateOneAsync(filter, update);

            return new Result(true, "Process started successfully");
        }
    }
} 