import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePageUpload from "./pages/HomePageUpload";
import WorkPage from "./pages/WorkPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePageUpload />} />

        <Route path="/work/:id" element={<WorkPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
