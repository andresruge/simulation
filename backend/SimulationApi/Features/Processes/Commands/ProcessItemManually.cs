using MediatR;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Models;
using MongoDB.Driver;
using FluentResults;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SimulationApi.Features.Processes.Commands;

public static class ProcessItemManually
{
    // Command now takes an integer ItemNumber
    public record Command(string ProcessId, int ItemNumber) : IRequest<Result<int>>; // Return the processed item number

    public class Handler : IRequestHandler<Command, Result<int>>
    {
        private readonly MongoDbContext _dbContext;
        private readonly ILogger<Handler> _logger;

        public Handler(MongoDbContext dbContext, ILogger<Handler> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<Result<int>> Handle(Command request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to manually process item number {ItemNumber} for process {ProcessId}", request.ItemNumber, request.ProcessId);

            var processFilter = Builders<Process>.Filter.Eq(p => p.Id, request.ProcessId);
            var process = await _dbContext.Processes.Find(processFilter).FirstOrDefaultAsync(cancellationToken);

            if (process == null)
            {
                _logger.LogWarning("Process not found: {ProcessId}", request.ProcessId);
                return Result.Fail($"Process with ID {request.ProcessId} not found.");
            }

            // Check if the item exists in the Items list
            if (!process.Items.Contains(request.ItemNumber))
            {
                 // Check if it was already processed
                 if (process.ProcessedItems.Contains(request.ItemNumber))
                 {
                    _logger.LogInformation("Item number {ItemNumber} already processed for process {ProcessId}", request.ItemNumber, request.ProcessId);
                    return Result.Ok(request.ItemNumber).WithSuccess($"Item number {request.ItemNumber} was already processed.");
                 }
                 else
                 {
                    _logger.LogWarning("Item number {ItemNumber} not found in process {ProcessId}", request.ItemNumber, request.ProcessId);
                    return Result.Fail($"Item number {request.ItemNumber} not found in process {request.ProcessId}.");
                 }
            }

            // Item exists in the Items list and is not yet processed
            try
            {
                // Simulate processing work
                _logger.LogDebug("Simulating processing for item number {ItemNumber}", request.ItemNumber);
                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken); // Simulate work
                _logger.LogInformation("Item number {ItemNumber} processed successfully", request.ItemNumber);

                // Atomically move the item from Items to ProcessedItems and update timestamp
                var updateFilter = Builders<Process>.Filter.Eq(p => p.Id, request.ProcessId);
                var update = Builders<Process>.Update
                    .Pull(p => p.Items, request.ItemNumber) // Remove from Items list
                    .AddToSet(p => p.ProcessedItems, request.ItemNumber) // Add to ProcessedItems list (ensures uniqueness)
                    .Set(p => p.UpdatedAt, DateTime.UtcNow); // Update the process timestamp

                var updateResult = await _dbContext.Processes.UpdateOneAsync(updateFilter, update, cancellationToken: cancellationToken);

                if (updateResult.ModifiedCount == 0)
                {
                     // This could happen if the item was processed by another request between the read and the update
                     _logger.LogWarning("Failed to update item {ItemNumber} status in database for process {ProcessId}. It might have been processed concurrently.", request.ItemNumber, process.Id);
                     // Re-fetch to check current state
                     var currentProcess = await _dbContext.Processes.Find(processFilter).FirstOrDefaultAsync(cancellationToken);
                     if (currentProcess != null && currentProcess.ProcessedItems.Contains(request.ItemNumber))
                     {
                         return Result.Ok(request.ItemNumber).WithSuccess($"Item number {request.ItemNumber} was processed concurrently.");
                     }
                     return Result.Fail($"Failed to update item {request.ItemNumber} status in the database.");
                }

                // Optionally, update overall process status if needed (e.g., check if all items are done)
                // if (process.Items.Count == 1) // If this was the last item
                // {
                //    var finalUpdate = Builders<Process>.Update.Set(p => p.Status, ProcessStatus.Completed);
                //    await _dbContext.Processes.UpdateOneAsync(processFilter, finalUpdate, cancellationToken: cancellationToken);
                // }

                return Result.Ok(request.ItemNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error manually processing item number {ItemNumber} for process {ProcessId}", request.ItemNumber, request.ProcessId);
                // We don't mark the item as failed here because it's just an int,
                // but the operation failed. The item remains in the 'Items' list.
                return Result.Fail($"An error occurred while processing item {request.ItemNumber}: {ex.Message}");
            }
        }
    }
}
