import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { ToastProvider } from './lib/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/products/ProductsPage';
import ProductForm from './pages/products/ProductForm';
import ManufacturersPage from './pages/manufacturers/ManufacturersPage';
import OffersPage from './pages/offers/OffersPage';
import OfferBuilder from './pages/offers/OfferBuilder';
import OfferDetailPreview from './pages/offers/OfferDetailPreview';
import SystemComponentsPage from './pages/system-components/SystemComponentsPage';
import ServicesPage from './pages/services/ServicesPage';
import ProjectInsightsPage from './pages/project-insights/ProjectInsightsPage';
import ProjectInsightForm from './pages/project-insights/ProjectInsightForm';
import ContactRequestsPage from './pages/contact-requests/ContactRequestsPage';
import PublicationPage from './pages/publication/PublicationPage';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';

function App() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <ToastProvider>
      <Routes>
        <Route path="/auth" element={<AuthCallback />} />
        {isAuthenticated ? (
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/manufacturers" element={<ManufacturersPage />} />
            <Route path="/project-insights" element={<ProjectInsightsPage />} />
            <Route path="/project-insights/new" element={<ProjectInsightForm />} />
            <Route path="/project-insights/:id/edit" element={<ProjectInsightForm />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/new" element={<OfferBuilder />} />
            <Route path="/offers/:id/edit" element={<OfferBuilder />} />
            <Route path="/offers/:id/preview" element={<OfferDetailPreview />} />
            <Route path="/contact-requests" element={<ContactRequestsPage />} />
            <Route path="/system-components" element={<SystemComponentsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/publication" element={<PublicationPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </ToastProvider>
  );
}

export default App;
