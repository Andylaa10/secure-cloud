import './app.css';
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard.tsx";
import NotFound from "@/pages/not-found.tsx";
import SignUp from "@/pages/sign-up.tsx";
import Home from "@/pages/home.tsx";
import Shared from "@/pages/shared.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import AuthGuard from "@/core/guards/auth-guard.tsx";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="page-theme">
            <Routes>
                {/* Public Routes */}
                <Route path="/sign-up" element={<SignUp />} />

                {/* Handle Keycloak Redirect and Dashboard */}
                <Route path="dashboard/*" element={<Dashboard />}>
                    {/* Protected Routes */}
                    <Route
                        path=""
                        element={
                            <AuthGuard>
                                <Navigate to="home" replace />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path="home"
                        element={
                            <AuthGuard>
                                <Home />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path="shared"
                        element={
                            <AuthGuard>
                                <Shared />
                            </AuthGuard>
                        }
                    />
                </Route>

                {/* Fallback Routes */}
                <Route path="*" element={<Navigate to="/not-found" replace />} />
                <Route path="/not-found" element={<NotFound />} />
                <Route path="/" element={<Navigate to="/sign-up" replace />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;
