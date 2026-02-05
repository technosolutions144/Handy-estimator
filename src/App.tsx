import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Dashboard from './pages/Dashboard';
import NewQuote from './pages/NewQuote';
import QuoteDetail from './pages/QuoteDetail';
import ShareQuote from './pages/ShareQuote';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/share/:id" element={<ShareQuote />} />
          <Route element={<AuthGuard />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<NewQuote />} />
              <Route path="/quote/:id" element={<QuoteDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
