import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './lib/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/products/ProductsPage';
import ProductForm from './pages/products/ProductForm';
import ManufacturersPage from './pages/manufacturers/ManufacturersPage';
import OffersPage from './pages/offers/OffersPage';
import OfferBuilder from './pages/offers/OfferBuilder';
import OfferComponentsPage from './pages/offers/OfferComponentsPage';
import Settings from './pages/Settings';

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/manufacturers" element={<ManufacturersPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/offers/new" element={<OfferBuilder />} />
          <Route path="/offers/:id/edit" element={<OfferBuilder />} />
          <Route path="/offer-components" element={<OfferComponentsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
