using MongoDB.Driver;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Models;

namespace SimulationApi.Features.Processes.Commands;

public static class CancelProcess
{
    public record Command(string Id, bool Revert);

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

            if (process.Status != ProcessStatus.Running)
            {
                return new Result(false, $"Cannot cancel process with status {process.Status}");
            }

            var newStatus = command.Revert ? ProcessStatus.CancelledWithRevert : ProcessStatus.Cancelled;
            var update = Builders<Process>.Update
                .Set(p => p.Status, newStatus)
                .Set(p => p.UpdatedAt, DateTime.UtcNow); // Update the timestamp
            await _context.Processes.UpdateOneAsync(filter, update);

            return new Result(true, $"Process cancelled successfully with {(command.Revert ? "revert" : "no revert")}");
        }
    }
}
