import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EventPage from "./pages/EventPage";
import EventsIndex from "./pages/EventsIndex";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/events/memorial-day-kickoff" />} />
        <Route path="/events" element={<EventsIndex />} />
        <Route path="/events/:slug" element={<EventPage />} />
      </Routes>
    </BrowserRouter>
  );
}
