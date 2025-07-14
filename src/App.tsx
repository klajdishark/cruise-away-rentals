import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {AuthProvider} from "@/hooks/useAuth";
import {ProtectedRoute} from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index/>}/>
                        <Route path="/auth" element={<Auth/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/cars" element={<Cars/>}/>
                        <Route path="/booking/:carId" element={<Booking/>}/>
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute requiredRole="customer">
                                    <Dashboard/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminDashboard/>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/how-it-works" element={<HowItWorks/>}/>
                        <Route path="/contact" element={<Contact/>}/>
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
