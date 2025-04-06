using MongoDB.Driver;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Models;

namespace SimulationApi.Features.Processes.Queries;

public static class GetProcessById
{
    public record Query(string Id);

    public class Handler
    {
        private readonly MongoDbContext _context;

        public Handler(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<Process?> HandleAsync(Query query)
        {
            var filter = Builders<Process>.Filter.Eq(p => p.Id, query.Id);
            return await _context.Processes.Find(filter).FirstOrDefaultAsync();
        }
    }
} 