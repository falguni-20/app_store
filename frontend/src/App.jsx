import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TenantSelect from "./pages/TenantSelect";
import ProtectedRoute from "./guards/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/tenant" element={<ProtectedRoute><TenantSelect /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  );
}
