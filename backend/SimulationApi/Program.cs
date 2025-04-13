using SimulationApi.Features.Common;
using SimulationApi.Features.Processes.Commands;
using SimulationApi.Features.Processes.Models;
using SimulationApi.Features.Processes.Queries;
using Microsoft.AspNetCore.Http.HttpResults;
using Swashbuckle.AspNetCore.SwaggerUI;
using Microsoft.OpenApi.Models;
using System.Reflection;
using FluentResults; // Added for Result handling in endpoint

var builder = WebApplication.CreateBuilder(args);

// Specify HTTP port
builder.WebHost.UseUrls("http://*:5000");

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with Scalar
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Process Simulation API",
        Version = "v1",
        Description = "A .NET Minimal API for simulating background processing of jobs",
        Contact = new OpenApiContact
        {
            Name = "Process Simulation Team"
        }
    });
    
    // Enable annotations for Swagger/Scalar
    options.EnableAnnotations();
    
    // Add XML comments
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Register MongoDB context
builder.Services.AddSingleton<MongoDbContext>();

// Register handlers
builder.Services.AddScoped<CreateProcess.Handler>();
builder.Services.AddScoped<StartProcess.Handler>();
builder.Services.AddScoped<CancelProcess.Handler>();
builder.Services.AddScoped<ProcessItem.Handler>();
builder.Services.AddScoped<ProcessItemManually.Handler>(); // Register the new handler
builder.Services.AddScoped<GetProcessById.Handler>();
builder.Services.AddScoped<GetAllProcesses.Handler>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Default Vite port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options =>
    {
        // Generate OpenAPI document
        options.PreSerializeFilters.Add((document, request) =>
        {
            document.Servers = new List<OpenApiServer> { new OpenApiServer { Url = $"{request.Scheme}://{request.Host}" } };
        });
    });
    
    // Enable static file serving for custom CSS
    app.UseStaticFiles();
    
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Simulation API v1");
        options.RoutePrefix = string.Empty;
        options.ConfigObject.AdditionalItems.Add("tryItOutEnabled", true);
        options.InjectStylesheet("/swagger-ui/custom.css");
        options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        options.DefaultModelsExpandDepth(-1);
        options.ConfigObject.AdditionalItems["syntaxHighlight"] = new Dictionary<string, object>
        {
            ["theme"] = "monokai"
        };
    });
    // Disable HTTPS redirection in development
}
else
{
    // Only use HTTPS redirection in production
    app.UseHttpsRedirection();
}

app.UseCors("AllowReactApp");

// Add a root endpoint that returns HTML for easy verification
app.MapGet("/", () => Results.Content(
    @"<!DOCTYPE html>
    <html>
    <head>
        <title>Simulation API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; }
            a { display: inline-block; background: #4CAF50; color: white; padding: 10px 15px; 
                text-decoration: none; border-radius: 4px; margin-top: 20px; }
            ul { margin-top: 20px; }
            li { margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <h1>Simulation API is running!</h1>
        <p>The backend API for process simulation is up and running.</p>
        <ul>
            <li><a href='/swagger'>API Documentation (Swagger)</a></li>
            <li><a href='/health'>Health Check</a></li>
        </ul>
        <p>Available endpoints:</p>
        <ul>
            <li><code>GET /api/processes</code> - Get all processes</li>
            <li><code>GET /api/processes/{id}</code> - Get process by ID</li>
            <li><code>POST /api/processes</code> - Create a new process</li>
            <li><code>POST /api/processes/{id}/start</code> - Start a process</li>
            <li><code>POST /api/processes/{id}/cancel</code> - Cancel a process</li>
            <li><code>POST /api/processes/{id}/process-item</code> - Process the next item</li>
        </ul>
    </body>
    </html>", "text/html"))
   .WithName("Root")
   .WithOpenApi(operation => {
       operation.Summary = "Root endpoint";
       operation.Description = "Returns a simple HTML page with API information";
       
       if (!operation.Responses.ContainsKey("200"))
           operation.Responses["200"] = new OpenApiResponse();
       operation.Responses["200"].Description = "HTML page with API information";
       
       return operation;
   });

// Add a health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
   .WithName("HealthCheck")
   .WithOpenApi(operation => {
       operation.Summary = "Health check";
       operation.Description = "Checks if the API is running properly";
       
       if (!operation.Responses.ContainsKey("200"))
           operation.Responses["200"] = new OpenApiResponse();
       operation.Responses["200"].Description = "API is healthy";
       
       return operation;
   });

// Define API endpoints
// GET: Get all processes
app.MapGet("/api/processes", async (GetAllProcesses.Handler handler) =>
{
    var result = await handler.HandleAsync(new GetAllProcesses.Query());
    return Results.Ok(result);
})
.WithName("GetAllProcesses")
.WithOpenApi(operation => {
    operation.Summary = "Get all processes";
    operation.Description = "Retrieves a list of all processes in the system regardless of their status";
    operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Processes" } };
    
    if (!operation.Responses.ContainsKey("200"))
        operation.Responses["200"] = new OpenApiResponse();
    operation.Responses["200"].Description = "A list of all processes was successfully retrieved";
    
    return operation;
});

// GET: Get process by id
app.MapGet("/api/processes/{id}", async (string id, GetProcessById.Handler handler) =>
{
    var result = await handler.HandleAsync(new GetProcessById.Query(id));
    
    if (result == null)
        return Results.NotFound();
        
    return Results.Ok(result);
})
.WithName("GetProcessById")
.WithOpenApi(operation => {
    operation.Summary = "Get a process by ID";
    operation.Description = "Retrieves details of a specific process by its unique identifier";
    operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Processes" } };
    
    if (!operation.Responses.ContainsKey("200"))
        operation.Responses["200"] = new OpenApiResponse();
    operation.Responses["200"].Description = "The process was found and returned successfully";
    
    if (!operation.Responses.ContainsKey("404"))
        operation.Responses["404"] = new OpenApiResponse();
    operation.Responses["404"].Description = "No process with the specified ID was found";
    
    return operation;
});

// POST: Create a new process
app.MapPost("/api/processes", async (CreateProcess.Command command, CreateProcess.Handler handler) =>
{
    var result = await handler.HandleAsync(command);
    return Results.Created($"/api/processes/{result.Id}", result);
})
.WithName("CreateProcess")
.WithOpenApi(operation => {
    operation.Summary = "Create a new process";
    operation.Description = "Creates a new background process with the specified items to be processed";
    operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Processes" } };
    
    if (!operation.Responses.ContainsKey("201"))
        operation.Responses["201"] = new OpenApiResponse();
    operation.Responses["201"].Description = "The process was created successfully";
    
    return operation;
});

// POST: Start a process
app.MapPost("/api/processes/{id}/start", async (string id, StartProcess.Handler handler) =>
{
    var result = await handler.HandleAsync(new StartProcess.Command(id));
    
    if (!result.Success)
        return Results.BadRequest(result);
        
    return Results.Ok(result);
})
.WithName("StartProcess")
.WithOpenApi(operation => {
    operation.Summary = "Start a process";
    operation.Description = "Changes the status of a process from 'NotStarted' to 'Running'";
    operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Process Actions" } };
    
    if (!operation.Responses.ContainsKey("200"))
        operation.Responses["200"] = new OpenApiResponse();
    operation.Responses["200"].Description = "The process was started successfully";
    
    if (!operation.Responses.ContainsKey("400"))
        operation.Responses["400"] = new OpenApiResponse();
    operation.Responses["400"].Description = "The process could not be started (already running, completed, or does not exist)";
    
    return operation;
});

// POST: Cancel a process
app.MapPost("/api/processes/{id}/cancel", async (string id, bool revert, CancelProcess.Handler handler) =>
{
    var result = await handler.HandleAsync(new CancelProcess.Command(id, revert));
    
    if (!result.Success)
        return Results.BadRequest(result);
        
    return Results.Ok(result);
})
.WithName("CancelProcess")
.WithOpenApi(operation => {
    operation.Summary = "Cancel a process";
    operation.Description = "Stops a running process. If 'revert' is true, it will attempt to revert processed items";
    operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Process Actions" } };
    
    if (!operation.Responses.ContainsKey("200"))
        operation.Responses["200"] = new OpenApiResponse();
    operation.Responses["200"].Description = "The process was cancelled successfully";
    
    if (!operation.Responses.ContainsKey("400"))
        operation.Responses["400"] = new OpenApiResponse();
    operation.Responses["400"].Description = "The process could not be cancelled (not running or does not exist)";
    
    return operation;
});

// POST: Process next item
app.MapPost("/api/processes/{id}/process-item", async (string id, ProcessItem.Handler handler) =>
{
    var result = await handler.HandleAsync(new ProcessItem.Command(id));
    
    if (!result.Success)
        return Results.BadRequest(result);
        
    return Results.Ok(result);
})
.WithName("ProcessItem")
.WithOpenApi(operation => {
    operation.Summary = "Process the next item";
    operation.Description = "Processes the next available item in a running process";
    operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Process Actions" } };
    
    if (!operation.Responses.ContainsKey("200"))
        operation.Responses["200"] = new OpenApiResponse();
    operation.Responses["200"].Description = "An item was processed successfully or the process was completed";
    
    if (!operation.Responses.ContainsKey("400"))
        operation.Responses["400"] = new OpenApiResponse();
    operation.Responses["400"].Description = "No item could be processed (process not running, no items left, or process does not exist)";
    
    return operation;
});

// POST: Process specific item manually
app.MapPost("/api/processes/{id}/items/{itemNumber}/process-manually", async (string id, int itemNumber, ProcessItemManually.Handler handler) =>
{
    var command = new ProcessItemManually.Command(id, itemNumber);
    var result = await handler.Handle(command, CancellationToken.None); // Assuming no cancellation token needed here

    if (result.IsFailed)
        return Results.BadRequest(result.ToResult()); // Convert FluentResult to standard result for response

    // Check for specific success messages if needed
    if (result.Successes.Any(s => s.Message.Contains("already processed")) || result.Successes.Any(s => s.Message.Contains("processed concurrently")))
    {
        // Return Ok but maybe with a specific message or status code if desired (e.g., 202 Accepted or 200 OK with message)
        return Results.Ok(new { ItemNumber = result.Value, Message = result.Successes.First().Message }); // Use First() as we know one exists
    }

    return Results.Ok(new { ItemNumber = result.Value }); // Return the processed item number on success
})
.WithName("ProcessItemManually")
.WithOpenApi(operation => {
    operation.Summary = "Manually process a specific item";
    operation.Description = "Processes a specific item within a process immediately (synchronously).";
    operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Process Actions" } };

    // Parameters 'id' and 'itemNumber' are automatically inferred from the route and method signature.

    // Define responses
    if (!operation.Responses.ContainsKey("200"))
        operation.Responses["200"] = new OpenApiResponse();
    operation.Responses["200"].Description = "The item was processed successfully, or was already processed.";

    if (!operation.Responses.ContainsKey("400"))
        operation.Responses["400"] = new OpenApiResponse();
    operation.Responses["400"].Description = "The item could not be processed (process not found, item not found, or processing error).";

    if (!operation.Responses.ContainsKey("404")) // Add 404 for process/item not found consistency
        operation.Responses["404"] = new OpenApiResponse();
    operation.Responses["404"].Description = "The specified process or item number was not found."; // Although handler returns BadRequest, API level could be 404

    return operation;
});


// Use this to debug startup issues
Console.WriteLine("Application started and listening on " + (builder.Configuration["Kestrel:Endpoints:Http:Url"] ?? "http://*:5000")); // Added null check

app.Run();
