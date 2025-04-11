# Process Simulation Full Stack Application

A full stack application to simulate background processing with a .NET 9 Minimal API backend, React frontend, and MongoDB database.

## Features

- Create, start, and cancel processes
- Process items one by one
- Revert processing when canceling
- Track process status and progress

## Tech Stack

- **Backend**: .NET 9 Minimal API, MongoDB
- **Frontend**: React, TypeScript, TailwindCSS
- **Architecture**: Vertical slices architecture

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Setup

### Backend

1. Start MongoDB on your local machine (default port: 27017)

2. Navigate to the backend directory:

   ```
   cd backend
   ```

3. Build the solution:

   ```
   dotnet build
   ```

4. Run the API:
   ```
   cd SimulationApi
   dotnet run
   ```

The API will be available at `http://localhost:5000`.

### Frontend

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`.

## API Endpoints

- `GET /api/processes` - Get all processes
- `GET /api/processes/{id}` - Get process by ID
- `POST /api/processes` - Create a new process
- `POST /api/processes/{id}/start` - Start a process
- `POST /api/processes/{id}/cancel` - Cancel a process
- `POST /api/processes/{id}/process-item` - Process the next item

## Project Structure

### Backend

The backend follows the vertical slices architecture:

- `Features/Processes/Commands` - Commands for modifying processes
- `Features/Processes/Models` - Process domain models
- `Features/Processes/Queries` - Queries for retrieving processes
- `Features/Common` - Shared components like MongoDB context

### Frontend

- `src/api` - API clients
- `src/components` - Reusable UI components
- `src/pages` - Application pages
- `src/types` - TypeScript interfaces and types

## Testing

To run backend tests:

```
cd backend
dotnet test
```
