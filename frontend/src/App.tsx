import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProcessListPage from "./pages/ProcessListPage";
import ProcessDetailPage from "./pages/ProcessDetailPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<ProcessListPage />} />
            <Route path="/processes/:id" element={<ProcessDetailPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
