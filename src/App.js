import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, clearAuth } from './store/authSlice';
import { fetchLands } from './store/landsSlice';
import { supabase } from './supabaseClient.js';

import MapExplorer from './pages/MapExplorer';
import MyLands from './pages/MyLands';
import NavigationRoute from './pages/NavigationRoute';
import FarmDetails from './pages/FarmDetails';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';

const DashboardLayout = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="w-screen h-screen flex items-center justify-center bg-[#f3f4f6]">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row w-screen h-[100dvh] overflow-hidden bg-[#f3f4f6]">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden min-h-0">
        <Outlet />
      </main>
    </div>
  );
};

const AuthLayout = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="w-screen h-screen flex items-center justify-center bg-white">Loading...</div>;
  }

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
    ]
  },
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <Navigate to="/welcome" replace />,
    children: [
      { path: "/", element: <Navigate to="/explorer" replace /> },
      { path: "explorer", element: <MapExplorer /> },
      { path: "lands", element: <MyLands /> },
      { path: "route", element: <NavigationRoute /> },
      { path: "land/:id", element: <FarmDetails /> },
      { path: "*", element: <Navigate to="/explorer" replace /> },
    ],
  },
]);

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial fetch of session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch(setAuth({ user: session.user, session }));
        dispatch(fetchLands());
      } else {
        dispatch(clearAuth());
      }
    });

    // Listen for auth changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(setAuth({ user: session.user, session }));
        dispatch(fetchLands());
      } else {
        dispatch(clearAuth());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return <RouterProvider router={router} />;
}
