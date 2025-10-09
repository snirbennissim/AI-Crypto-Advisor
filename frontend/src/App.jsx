import {
  Routes,
  Route,
  Navigate,
  BrowserRouter,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";

import { axiosInstance } from "./lib/axios.js";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

function Protected({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const fallback = setTimeout(() => {
      if (!isMounted) return;
      setOk(true);
      setNeedsOnboarding(false);
      setLoading(false);
    }, 8000);

    async () => {
      try {
        const { data } = await axiosInstance.get("/onboarding/profile");
        if (!isMounted) {
          return;
        }
        console.log("PROFILE:", data);
        setOk(true);
        setNeedsOnboarding(!data?.onboarded);
      } catch (error) {
        if (!isMounted) return;
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setOk(false);
        } else {
          console.error("profile check failed:", status, error?.message);
          setOk(true);
          setNeedsOnboarding(false);
        }
      } finally {
        if (isMounted) {
          clearTimeout(fallback);
          setLoading(false);
        }
      }
    };
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!ok) {
    return <Navigate to="/login" replace />;
  }

  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
