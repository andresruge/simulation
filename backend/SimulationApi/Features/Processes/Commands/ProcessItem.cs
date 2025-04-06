using MongoDB.Driver;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Models;

namespace SimulationApi.Features.Processes.Commands;

public static class ProcessItem
{
    public record Command(string Id);

    public record Result(bool Success, string Message, int? ProcessedItem = null);

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
                return new Result(false, $"Cannot process item in process with status {process.Status}");
            }

            // Find the next item to process
            var nextItem = process.Items.Except(process.ProcessedItems).FirstOrDefault();
            if (nextItem == 0) // Since 0 is the default for int, we use it to check if there are no more items
            {
                // Complete the process
                var completeUpdate = Builders<Process>.Update.Set(p => p.Status, ProcessStatus.Completed);
                await _context.Processes.UpdateOneAsync(filter, completeUpdate);
                return new Result(true, "All items processed, process completed");
            }

            // Update processed items
            var update = Builders<Process>.Update.Push(p => p.ProcessedItems, nextItem);
            await _context.Processes.UpdateOneAsync(filter, update);

            return new Result(true, $"Item {nextItem} processed successfully", nextItem);
        }
    }
} 