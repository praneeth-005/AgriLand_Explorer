import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate, useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, clearAuth } from './store/authSlice';
import { fetchLands } from './store/landsSlice';
import { checkAndRestockDaily } from './store/tierSlice';
import { supabase } from './supabaseClient.js';

import MapExplorer from './pages/MapExplorer';
import MyLands from './pages/MyLands';
import NavigationRoute from './pages/NavigationRoute';
import FarmDetails from './pages/FarmDetails';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Sidebar from './components/Sidebar';
import AgriAIChatbot from './components/AgriAIChatbot';
import SoilMoistureCalculator from './components/SoilMoistureCalculator';
import TierStatusModal from './components/TierStatusModal';
import FieldLimitModal from './components/FieldLimitModal';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isSoilCalcOpen, setIsSoilCalcOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  const modalHandlers = {
    onOpenLimitModal: () => setIsLimitModalOpen(true),
    onOpenTierModal: () => setIsTierModalOpen(true),
    onOpenSoilCalc: () => setIsSoilCalcOpen(true),
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row w-full h-[100dvh] overflow-hidden bg-[#f3f4f6]">
      <Sidebar 
        onOpenTierModal={() => setIsTierModalOpen(true)}
        onOpenSoilCalc={() => setIsSoilCalcOpen(true)}
      />

      <main className="flex-1 relative overflow-hidden min-h-0">
        <Outlet context={modalHandlers} />
      </main>

      {/* Global Interactive Modals */}
      <AgriAIChatbot 
        isOpen={isChatbotOpen} 
        onToggle={() => setIsChatbotOpen(prev => !prev)}
        onOpenRestockModal={() => setIsTierModalOpen(true)}
      />

      <SoilMoistureCalculator 
        isOpen={isSoilCalcOpen} 
        onClose={() => setIsSoilCalcOpen(false)} 
      />

      <TierStatusModal 
        isOpen={isTierModalOpen} 
        onClose={() => setIsTierModalOpen(false)}
        onOpenSoilCalc={() => setIsSoilCalcOpen(true)}
      />

      <FieldLimitModal 
        isOpen={isLimitModalOpen} 
        onClose={() => setIsLimitModalOpen(false)} 
      />
    </div>
  );
};

const MapExplorerWrapper = () => {
  const { onOpenLimitModal } = useOutletContext();
  return <MapExplorer onOpenLimitModal={onOpenLimitModal} />;
};

const MyLandsWrapper = () => {
  const { onOpenLimitModal, onOpenTierModal, onOpenSoilCalc } = useOutletContext();
  return <MyLands onOpenLimitModal={onOpenLimitModal} onOpenTierModal={onOpenTierModal} onOpenSoilCalc={onOpenSoilCalc} />;
};

const FarmDetailsWrapper = () => {
  const { onOpenSoilCalc } = useOutletContext();
  return <FarmDetails onOpenSoilCalc={onOpenSoilCalc} />;
};

const AuthLayout = () => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to="/explorer" replace />;
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/welcome", element: <Welcome /> },
      { path: "/login", element: <Login /> },
      { path: "/admin-login", element: <AdminLogin /> },
    ]
  },
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <Navigate to="/welcome" replace />,
    children: [
      { path: "/", element: <Navigate to="/explorer" replace /> },
      { path: "explorer", element: <MapExplorerWrapper /> },
      { path: "lands", element: <MyLandsWrapper /> },
      { path: "route", element: <NavigationRoute /> },
      { path: "land/:id", element: <FarmDetailsWrapper /> },
      { path: "*", element: <Navigate to="/explorer" replace /> },
    ],
  },
]);

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check daily restock status on application launch
    dispatch(checkAndRestockDaily());

    let isMounted = true;

    // Fallback timeout guarantee: prevent infinite Loading spinner if Supabase network fetch fails
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        dispatch(clearAuth());
      }
    }, 1500);

    // Initial fetch of session with error handling
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        if (session) {
          dispatch(setAuth({ user: session.user, session }));
          dispatch(fetchLands());
        } else {
          dispatch(clearAuth());
        }
      })
      .catch((err) => {
        console.warn("Supabase auth session fetch warning:", err);
        clearTimeout(timeoutId);
        if (isMounted) dispatch(clearAuth());
      });

    // Listen for auth changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session) {
        dispatch(setAuth({ user: session.user, session }));
        dispatch(fetchLands());
      } else {
        dispatch(clearAuth());
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <RouterProvider router={router} />;
}
