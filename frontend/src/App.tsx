import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProcessListPage } from "./pages/ProcessListPage";
import { ProcessDetailPage } from "./pages/ProcessDetailPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProcessListPage />} />
        <Route path="/process/:id" element={<ProcessDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
