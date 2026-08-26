import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Reviews } from "./pages/Reviews";
import { CustomerCases } from "./pages/CustomerCases";
import { CaseDetail } from "./pages/CaseDetail";
import { EngineeringIssues } from "./pages/EngineeringIssues";
import { IssueDetail } from "./pages/IssueDetail";
import { Analytics } from "./pages/Analytics";
import { AgentWorkflow } from "./pages/AgentWorkflow";
import { Integrations } from "./pages/Integrations";
import { Settings } from "./pages/Settings";
import { ProductFeed } from "./pages/ProductFeed";
import { ProductDetail } from "./pages/ProductDetail";
import { MyReviews } from "./pages/MyReviews";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
      <Route path="/reviews" element={<RequireAuth><Reviews /></RequireAuth>} />
      <Route path="/cases" element={<RequireAuth><CustomerCases /></RequireAuth>} />
      <Route path="/cases/:id" element={<RequireAuth><CaseDetail /></RequireAuth>} />
      <Route path="/issues" element={<RequireAuth><EngineeringIssues /></RequireAuth>} />
      <Route path="/issues/:id" element={<RequireAuth><IssueDetail /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
      <Route path="/workflow" element={<RequireAuth><AgentWorkflow /></RequireAuth>} />
      <Route path="/integrations" element={<RequireAuth><Integrations /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

      <Route path="/feed" element={<RequireAuth><ProductFeed /></RequireAuth>} />
      <Route path="/feed/:id" element={<RequireAuth><ProductDetail /></RequireAuth>} />
      <Route path="/my-reviews" element={<RequireAuth><MyReviews /></RequireAuth>} />

      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "DEVELOPER" ? "/dashboard" : "/feed"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
