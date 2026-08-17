import { Link, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import Explore from "./pages/Explore/Explore";
import SetBrowser from "./pages/SetBrowser/SetBrowser";
import CardDetails from "./pages/CardDetails/CardDetails";
import "./App.css";

// Placeholder for the Digital Binder screen.
// Phase 6 will replace this with the real implementation.
function BinderPlaceholder() {
  return (
    <section className="explore">
      <Link to="/explore" className="back-link">
        ← Back to Explore
      </Link>
      <h2>Binder coming soon</h2>
      <p>This screen will be built in Phase 6.</p>
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
        <Route path="/explore/:setId" element={<SetBrowser />} />
        <Route path="/card/:cardId" element={<CardDetails />} />
        <Route path="/binder" element={<BinderPlaceholder />} />
      </Routes>
    </main>
  );
}

export default App;
