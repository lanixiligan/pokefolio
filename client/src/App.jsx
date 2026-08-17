import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import Header from "./components/layout/Header";
import Explore from "./pages/Explore/Explore";
import SetBrowser from "./pages/SetBrowser/SetBrowser";
import "./App.css";

// Placeholder for the Card Details screen.
// Phase 5 will replace this with the real implementation.
function CardDetailsPlaceholder() {
  const { cardId } = useParams();

  return (
    <section className="explore">
      <Link to="/explore" className="back-link">
        ← Back to Explore
      </Link>
      <h2>Card Details coming soon</h2>
      <p>Card {cardId} will be shown here in Phase 5.</p>
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
        <Route path="/card/:cardId" element={<CardDetailsPlaceholder />} />
      </Routes>
    </main>
  );
}

export default App;
