import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/protected";
import UnprotectedRoute from "./components/unprotected"
import Dashboard from "./pages/dashboard";
import RealtimeStatsPage from "./pages/RealtimeSatatsPage";
import { Toaster } from 'react-hot-toast';
import Users from "./pages/Users";
import UserAnalytics from "./pages/UserAnalytics";
import MeetingRoom from "./pages/Meeting-Room";
import Employees from "./pages/Employees"
import SettingsComponent from "./pages/Settings"
import { closeSettings } from "./features/slices/authSlice"
import { useSelector } from "react-redux"
import Mail from "./pages/Mail"

export default function App() {

  const { setting } = useSelector((state) => state.auth);

  return (
    <>
      <BrowserRouter>
        <SettingsComponent onClose={closeSettings} open={setting} />
        <Toaster
          position="top-right"
          reverseOrder={false}
        />

        <Routes>
          {/* UnProtected Routes */}
          <Route element={<UnprotectedRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/real-time-stats" element={<RealtimeStatsPage />} />
            <Route path="/users-list/:appId" element={<Users />} />
            <Route path="/user/:appId/:userId/:channel" element={<UserAnalytics />} />
            <Route path="/meeting-room" element={<MeetingRoom />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/mail" element={<Mail/>} />
          </Route>
  
        </Routes>

      </BrowserRouter>
    </>
  );
}
