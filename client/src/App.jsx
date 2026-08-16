import { Link, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import Explore from "./pages/Explore/Explore";
import "./App.css";

// Placeholder for the Set Card Browser screen.
// Phase 4 will replace this with the real implementation.
function SetBrowserPlaceholder() {
  return (
    <section className="explore">
      <Link to="/explore" className="back-link">
        ← Back to Explore
      </Link>
      <h2>Set Card Browser coming soon</h2>
      <p>This screen will be built in Phase 4.</p>
    </section>
  );
}

function App() {
  return (
    <main>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:setId" element={<SetBrowserPlaceholder />} />
      </Routes>
    </main>
  );
}

export default App;