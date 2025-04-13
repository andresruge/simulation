using MongoDB.Driver;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Models; // Keep this for the model
using System.Diagnostics; // Keep this for Stopwatch

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
            // Explicitly use Models.Process for the filter
            var filter = Builders<Models.Process>.Filter.Eq(p => p.Id, command.Id);
            var process = await _context.Processes.Find(filter).FirstOrDefaultAsync();

            if (process == null)
            {
                return new Result(false, "Process not found");
            }

            if (process.Status != ProcessStatus.NotStarted)
            {
                return new Result(false, $"Cannot start process with status {process.Status}");
            }

            // Update status to Running immediately
            // Explicitly use Models.Process for the update
            var initialUpdate = Builders<Models.Process>.Update
                .Set(p => p.Status, ProcessStatus.Running)
                .Set(p => p.UpdatedAt, DateTime.UtcNow);
            await _context.Processes.UpdateOneAsync(filter, initialUpdate);

            // Start background processing without awaiting it
            _ = Task.Run(async () => await ProcessItemsInBackground(process.Id, process.Items));

            return new Result(true, "Process started in the background."); // Indicate background start
        }

        private async Task ProcessItemsInBackground(string processId, List<int> items)
        {
            // Explicitly use Models.Process for the filter
            var filter = Builders<Models.Process>.Filter.Eq(p => p.Id, processId);
            var stopwatch = Stopwatch.StartNew(); // Optional: for logging duration
            Console.WriteLine($"Starting background processing for Process ID: {processId}");

            try
            {
                await Parallel.ForEachAsync(items, new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount }, async (item, cancellationToken) =>
                {
                    Console.WriteLine($"Processing item {item} for Process ID: {processId}...");
                    // Simulate work
                    await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken); // 30 second delay

                    // Atomically add the processed item to the list
                    // Explicitly use Models.Process for the update
                    var update = Builders<Models.Process>.Update
                        .Push(p => p.ProcessedItems, item)
                        .Set(p => p.UpdatedAt, DateTime.UtcNow);
                    await _context.Processes.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
                    Console.WriteLine($"Finished processing item {item} for Process ID: {processId}");
                });

                // All items processed, update status to Completed
                // Explicitly use Models.Process for the update
                var finalUpdate = Builders<Models.Process>.Update
                    .Set(p => p.Status, ProcessStatus.Completed)
                    .Set(p => p.UpdatedAt, DateTime.UtcNow);
                await _context.Processes.UpdateOneAsync(filter, finalUpdate);

                stopwatch.Stop();
                Console.WriteLine($"Background processing for Process ID: {processId} completed in {stopwatch.ElapsedMilliseconds} ms.");
            }
            catch (Exception ex)
            {
                // Log the error and potentially update the process status to Failed
                Console.WriteLine($"Error during background processing for Process ID: {processId}. Error: {ex.Message}");
                // Explicitly use Models.Process for the update
                var errorUpdate = Builders<Models.Process>.Update
                    .Set(p => p.Status, ProcessStatus.Failed)
                    .Set(p => p.UpdatedAt, DateTime.UtcNow);
                await _context.Processes.UpdateOneAsync(filter, errorUpdate);
            }
        }
    }
}
