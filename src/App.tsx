import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import HeroPage from './pages/HeroPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import MenuPage from './pages/MenuPage';
import PromoPage from './pages/PromoPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <BrowserRouter basename="/SaungBaraya">
          <Routes>
            <Route path="/" element={<HeroPage />} />
            <Route path="/tentang" element={<AboutPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/promo" element={<PromoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allow={['pelanggan']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          </BrowserRouter>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
