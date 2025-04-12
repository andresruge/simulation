import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProcessListPage from "./pages/ProcessListPage";
import ProcessDetailPage from "./pages/ProcessDetailPage";
import ProcessCreatePage from "./pages/ProcessCreatePage";
import "./App.css"; // Keep this import for centering

// App container styles
const appContainerStyle = {
  minHeight: "100vh",
  backgroundColor: "#f9fafb", // Equivalent to bg-gray-50
};

// Content container styles
const contentContainerStyle = {
  maxWidth: "80rem", // Equivalent to max-w-7xl
  margin: "0 auto",
  padding: "2rem 1rem", // Combining py-8 with px-4
};

// Media query styles handled by App.css (margin: 0 auto and centering)

function App() {
  return (
    <Router>
      <div style={appContainerStyle}>
        <div style={contentContainerStyle}>
          <Routes>
            <Route path="/" element={<ProcessListPage />} />
            <Route path="/processes/create" element={<ProcessCreatePage />} />
            <Route path="/processes/:id" element={<ProcessDetailPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
