import { BrowserRouter, Routes, Route } from "react-router-dom";
import {HomePage} from "../pages/HomePage";
import {UploadPage} from "../pages/UploadPage";
import {WorkPage} from "../pages/WorkPage";
import {ResultPage} from "../pages/ResultPage";
import {HelpPage} from "../pages/HelpPage";

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/work/:jobId" element={<WorkPage />} />
                <Route path="/result/:jobId" element={<ResultPage />} />
                <Route path="/help" element={<HelpPage />} />
            </Routes>
        </BrowserRouter>
    );
}