import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePageUpload from "./pages/HomePageUpload";
import WorkPage from "./pages/WorkPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home (upload) page */}
        <Route path="/" element={<HomePageUpload />} />

        {/* Work page (viewer/editor) */}
        <Route path="/work/:id" element={<WorkPage />} />

        {/* Optional: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
