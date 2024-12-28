import './app.css'
import {Navigate, Route, Routes} from "react-router-dom";
import Dashboard from "./pages/dashboard.tsx"
import NotFound from "@/pages/not-found.tsx";
import SignUp from "@/pages/sign-up.tsx";
import Home from "@/pages/home.tsx";
import Files from "@/pages/files.tsx";
import Shared from "@/pages/shared.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="page-theme">
            <Routes>
                <Route path="/sign-up" element={<SignUp/>}/>
                {/*
            Add auth guard
            */}
                <Route
                    path="dashboard"
                    element={
                        <Dashboard/>
                    }
                >
                    <Route
                        path=""
                        element={<Navigate to="home" replace/>}
                    />
                    <Route path='home' element={<Home/>}/>
                    <Route path='files' element={<Files/>}/>
                    <Route path='shared' element={<Shared/>}/>

                </Route>
                <Route
                    path="*"
                    element={<Navigate to="/not-found" replace/>}
                />
                <Route
                    path=""
                    element={<Navigate to="/sign-up" replace/>}
                />
                <Route path="/not-found" element={<NotFound/>}/>

            </Routes>
        </ThemeProvider>

    );

}

export default App
