using MongoDB.Driver;
using Moq;
using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Commands;
using SimulationApi.Features.Processes.Models;
using Xunit;

namespace SimulationApi.Tests.Features.Processes;

public class CreateProcessTests
{
    [Fact]
    public async Task HandleAsync_Should_Create_Process_With_NotStarted_Status()
    {
        // Arrange
        var mockCollection = new Mock<IMongoCollection<Process>>();
        
        mockCollection
            .Setup(x => x.InsertOneAsync(
                It.IsAny<Process>(),
                It.IsAny<InsertOneOptions>(),
                default))
            .Returns(Task.CompletedTask);

        var mockContext = new Mock<MongoDbContext>(null);
        mockContext.Setup(x => x.Processes).Returns(mockCollection.Object);

        var handler = new CreateProcess.Handler(mockContext.Object);
        var items = new List<int> { 1, 2, 3 };
        
        // Act
        var result = await handler.HandleAsync(new CreateProcess.Command(items));
        
        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.Id);
        
        mockCollection.Verify(x => x.InsertOneAsync(
            It.Is<Process>(p => 
                p.Status == ProcessStatus.NotStarted && 
                p.Items.SequenceEqual(items) &&
                !p.ProcessedItems.Any()),
            It.IsAny<InsertOneOptions>(),
            default), 
            Times.Once);
    }
} 