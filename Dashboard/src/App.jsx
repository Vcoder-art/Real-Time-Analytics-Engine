import "./App.css"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/protected";
import UnprotectedRoute from "./components/unprotected"


import Dashboard from "./pages/dashboard";
import RealtimeStatsPage from "./pages/RealtimeSatatsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
         {/* UnProtected Routes */}
        <Route element={<UnprotectedRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/real-time-stats" element={<RealtimeStatsPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
