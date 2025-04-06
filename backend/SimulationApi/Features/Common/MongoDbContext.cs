using MongoDB.Driver;
using SimulationApi.Features.Processes.Models;

namespace SimulationApi.Features.Common;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly ILogger<MongoDbContext> _logger;

    public MongoDbContext(IConfiguration configuration, ILogger<MongoDbContext> logger)
    {
        _logger = logger;
        try
        {
            var connectionString = configuration.GetConnectionString("MongoDb") ?? "mongodb://localhost:27017";
            var databaseName = configuration["MongoDB:DatabaseName"] ?? "SimulationDb";
            
            _logger.LogInformation("Connecting to MongoDB at {ConnectionString} with database {DatabaseName}", 
                connectionString, databaseName);
            
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
            
            // Test the connection
            _database.RunCommandAsync((Command<MongoDB.Bson.BsonDocument>)"{ping:1}")
                .Wait(); // Synchronously wait to ensure connection works
                
            _logger.LogInformation("Successfully connected to MongoDB");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to MongoDB");
            throw; // Rethrow the exception to fail fast if MongoDB is not available
        }
    }

    public IMongoCollection<Process> Processes => _database.GetCollection<Process>("Processes");
} 