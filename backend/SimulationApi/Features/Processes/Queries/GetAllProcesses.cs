using MongoDB.Driver;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Models;

namespace SimulationApi.Features.Processes.Queries;

public static class GetAllProcesses
{
    public record Query();

    public class Handler
    {
        private readonly MongoDbContext _context;

        public Handler(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<List<Process>> HandleAsync(Query query)
        {
            return await _context.Processes.Find(_ => true).ToListAsync();
        }
    }
} 