import { lazy, Suspense, useEffect, useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './Layout/ProtectedRoute/ProtectedRoute'
import DashboardLayout from './Layout/DashboardLayout/DashboardLayout'
import PublicLayout from './Layout/PublicLayout/PublicLayout'
import Loading from './components/Loading/Loading'
import logo from './assets/Logo.jpg'

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
const OverView = lazy(() => import("./pages/dashboard/OverView/OverView"));
const Wish = lazy(() => import("./pages/dashboard/Wish/Wish"));
const FeaturedAllProduct = lazy(() => import("./pages/dashboard/FeaturedProduct/AllProduct/FeaturedAllProduct"));
const FeaturedAddProduct = lazy(() => import("./pages/dashboard/FeaturedProduct/AddProduct/FeaturedAddProduct"));
const SpecialDetails = lazy(() => import("./components/Home/Special/SpecialDetails"));
const FeaturedUpdateProduct = lazy(() => import("./pages/dashboard/FeaturedProduct/UpdateProduct/FeaturedUpdateProduct"));
const OnlineAllProduct = lazy(() => import("./pages/dashboard/OnlineProduct/AllProduct/OnlineAllProduct"));
const AddOnlineProduct = lazy(() => import("./pages/dashboard/OnlineProduct/AddProduct/AddOnlineProduct"));
const OnlineUpdateProduct = lazy(() => import("./pages/dashboard/OnlineProduct/UpdateProduct/OnlineUpdateProduct"));
const OnlineDetails = lazy(() => import("./components/Home/Online/OnlineDetails"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const OfferAllProduct = lazy(() => import("./pages/dashboard/OfferProduct/AllProduct/OfferAllProduct"));
const OfferAddProduct = lazy(() => import("./pages/dashboard/OfferProduct/AddProduct/OfferAddProduct"));
const OfferUpdateProduct = lazy(() => import("./pages/dashboard/OfferProduct/UpdateProduct/OfferUpdateProduct"));
const OfferDetails = lazy(() => import("./components/Home/Offer/OfferDetails"));
const AllCoupon = lazy(() => import("./pages/dashboard/Coupon/AllCoupon"));



function App() {
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setTimeout(()=>{
      setLoading(false)
    },2000)
    return () => clearTimeout();
  },[])

   if (loading) {
    return (
      <div className="splash-loading">
        <img loading='lazy' src={logo} alt="Logo" className="splash-logo" />
        <Loading />
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>

      <Routes>

         {/* Dashboard Layout  */}
            <Route element={<ProtectedRoute allowedRoles={"admin"}/>} >
              <Route path='/dashboard' element={<DashboardLayout />}>
              <Route path='/dashboard' element={<OverView />} />

              <Route path='user' element={<User />} />

              <Route path='products' element={<AllProduct />} />
              <Route path='products/add-product' element={<AddProduct />} />
              <Route path='products/update-product/:id' element={<UpdateProduct />} />
              
              <Route path='featured-products' element={<FeaturedAllProduct />} />
              <Route path='featured-products/add-featured-product' element={<FeaturedAddProduct />} />
              <Route path='featured-products/update-product/:id' element={<FeaturedUpdateProduct />} />
              
              <Route path='online-products' element={<OnlineAllProduct />} />
              <Route path='online-products/add-online-product' element={<AddOnlineProduct />} />
              <Route path='online-products/update-product/:id' element={<OnlineUpdateProduct />} />
              
              <Route path='offer-products' element={<OfferAllProduct />} />
              <Route path='offer-products/add-offer-product' element={<OfferAddProduct />} />
              <Route path='offer-products/update-product/:id' element={<OfferUpdateProduct />} />
              
              <Route path='coupons' element={<AllCoupon />} />
              
              <Route path='carts' element={<Cart />} />

              <Route path='wish' element={<Wish />} />

              {/* <Route path='without' element={<Without />} /> */}
              
              </Route>
            
            </Route>

            {/* Public Layout  */}

            <Route element={<PublicLayout />}>
              <Route index element={<Home />}/>
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signin" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Product />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path='featuredProduct/:id' element={<SpecialDetails />} />
              <Route path='onlineProduct/:id' element={<OnlineDetails />} />
              <Route path='offerProduct/:id' element={<OfferDetails />} />
              <Route path="/cart" element={<YourCart />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

      </Routes>

    </Suspense>
  )
}

export default App
