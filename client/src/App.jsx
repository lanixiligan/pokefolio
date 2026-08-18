import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import Explore from "./pages/Explore/Explore";
import SetBrowser from "./pages/SetBrowser/SetBrowser";
import CardDetails from "./pages/CardDetails/CardDetails";
import Binder from "./pages/Binder/Binder";
import "./App.css";

function App() {
  return (
    <main>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:setId" element={<SetBrowser />} />
        <Route path="/card/:cardId" element={<CardDetails />} />
        <Route path="/binder" element={<Binder />} />
      </Routes>
    </main>
  );
}

export default App;
