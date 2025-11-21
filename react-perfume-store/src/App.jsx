import { lazy, Suspense, useEffect, useState, useContext } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './Layout/ProtectedRoute/ProtectedRoute'
import DashboardLayout from './Layout/DashboardLayout/DashboardLayout'
import PublicLayout from './Layout/PublicLayout/PublicLayout'
import Loading from './components/Loading/Loading'
import { userContext } from './context/UserContext'
import { useLang } from './context/LangContext'
const logo = '/assets/Logo3.png'

const Home = lazy(() => import("./pages/Home/Home"));
const About = lazy(() => import("./pages/About/About"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const Product = lazy(() => import("./pages/Products/Product/Product"));
const ProductDetails = lazy(() => import("./pages/Products/ProductDetails/ProductDetails"));
const User = lazy(() => import("./pages/dashboard/User/User"));
const AllProduct = lazy(() => import("./pages/dashboard/Product/AllProduct/AllProduct"));
const AddProduct = lazy(() => import("./pages/dashboard/Product/AddProduct/AddProduct"));
const UpdateProduct = lazy(() => import("./pages/dashboard/Product/UpdateProduct/UpdateProduct"));
const Cart = lazy(() => import("./pages/dashboard/Cart/Cart"));
const YourCart = lazy(() => import("./pages/Cart/YourCart"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const OverView = lazy(() => import("./pages/dashboard/OverView/OverView"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const OfferDetails = lazy(() => import("./components/Home/Offer/OfferDetails"));
const SpecialDetails = lazy(() => import("./components/Home/Special/SpecialDetails"));
const OnlineDetails = lazy(() => import("./components/Home/Online/OnlineDetails"));
const Offers = lazy(() => import("./pages/dashboard/Offers/NewOffers"));
const AddEditOffer = lazy(() => import("./pages/dashboard/Offers/AddEditOffer"));
const UserOffers = lazy(() => import("./pages/Offers/Offers"));
const UserDetail = lazy(() => import("./pages/dashboard/User/UserDetail"));
const ProductDetail = lazy(() => import("./pages/dashboard/Product/ProductDetail/ProductDetail"));
const OrderDetail = lazy(() => import("./pages/dashboard/Order/OrderDetail"));
const UserOrders = lazy(() => import("./pages/Orders/UserOrders"));
const UserOrderDetail = lazy(() => import("./pages/Orders/UserOrderDetail"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess/OrderSuccess"));
const OrderTracking = lazy(() => import("./pages/OrderTracking/OrderTracking"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Unauthenticated = lazy(() => import("./pages/Unauthenticated/Unauthenticated"));
const CommonQuestions = lazy(() => import("./pages/CommonQuestions/CommonQuestions"));



// AppContent component that has access to userContext
function AppContent() {
  const { lang } = useLang();

  // Update document title based on language
  useEffect(() => {
    document.title = lang === "ar" ? "مكانك" : "Makank";
  }, [lang]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>

         {/* Dashboard Layout  */}
            <Route element={<ProtectedRoute allowedRoles={"admin"}/>} >
              <Route path='/dashboard' element={<DashboardLayout />}>
              <Route path='/dashboard' element={<OverView />} />

              <Route path='user' element={<User />} />
              <Route path='user/:id' element={<UserDetail />} />

              <Route path='products' element={<AllProduct />} />
              <Route path='products/add-product' element={<AddProduct />} />
              <Route path='products/update-product/:id' element={<UpdateProduct />} />
              <Route path='products/:id' element={<ProductDetail />} />
              
              <Route path='offers' element={<Offers />} />
              <Route path='offers/add' element={<AddEditOffer />} />
              <Route path='offers/edit/:id' element={<AddEditOffer />} />
              
              
                     <Route path='carts' element={<Cart />} />
                     <Route path='cart/:id' element={<OrderDetail />} />

              {/* <Route path='without' element={<Without />} /> */}
              
              </Route>
            
            </Route>

            {/* Public Layout  */}

            <Route element={<PublicLayout />}>
              <Route index element={<Home />}/>
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/common-questions" element={<CommonQuestions />} />
              <Route path="/signin" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Product />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/offers" element={<UserOffers />} />
              <Route path='offerProduct/:id' element={<OfferDetails />} />
              <Route path='featuredProduct/:id' element={<SpecialDetails />} />
              <Route path='onlineProduct/:id' element={<OnlineDetails />} />
              <Route path="/cart" element={<YourCart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<UserOrders />} />
              <Route path="/orders/:id" element={<UserOrderDetail />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/track-order/:token" element={<OrderTracking />} />
              <Route path="/unauthenticated" element={<Unauthenticated />} />
              <Route path="*" element={<NotFound />} />
            </Route>

      </Routes>
    </Suspense>
  );
}

function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const userContextValue = useContext(userContext);
  const userLoading = userContextValue?.loading ?? true;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Show splash screen until both app initialization and user context are ready
  const isLoading = appLoading || userLoading;

  // Handle smooth transition when loading completes
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300); // Wait for fade-out animation
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || !showContent) {
    return (
      <div className={`splash-loading ${!isLoading ? 'fade-out' : ''}`}>
        <svg className="sketch-filter" width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id="sketch">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/>
            </filter>
          </defs>
        </svg>
        <div className="logo-circle">
          <img loading='lazy' src={logo} alt="Logo" className="splash-logo" />
        </div>
        <Loading />
      </div>
    );
  }

  return <AppContent />;
}

export default App
