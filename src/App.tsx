import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Status from './pages/Status';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:brand" element={<ProductDetail />} />
            <Route path="/cek-status" element={<Status />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}
