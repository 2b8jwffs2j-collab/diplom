import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import RefundRequests from './pages/RefundRequests';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Routes>
      {/* Auth pages without Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* All other pages with Layout */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/refund-requests" element={<RefundRequests />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
