import { useEffect, useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Product from './pages/Products/Product/Product'
import ProductDetails from './pages/Products/ProductDetails/ProductDetails'
import ProtectedRoute from './Layout/ProtectedRoute/ProtectedRoute'
import DashboardLayout from './Layout/DashboardLayout/DashboardLayout'
import PublicLayout from './Layout/PublicLayout/PublicLayout'
import User from './pages/dashboard/User/User'
import AllProduct from './pages/dashboard/Product/AllProduct/AllProduct'
import AddProduct from './pages/dashboard/Product/AddProduct/AddProduct'
import UpdateProduct from './pages/dashboard/Product/UpdateProduct/UpdateProduct'
import Cart from './pages/dashboard/Cart/Cart'
import YourCart from './pages/Cart/YourCart'
import OverView from './pages/dashboard/OverView/OverView'
import Wish from './pages/dashboard/Wish/Wish'
import Loading from './components/Loading/Loading'
import logo from './assets/Logo.jpg'
import Without from './pages/dashboard/Without/Without'
import FeaturedAllProduct from './pages/dashboard/FeaturedProduct/AllProduct/FeaturedAllProduct'
import FeaturedAddProduct from './pages/dashboard/FeaturedProduct/AddProduct/FeaturedAddProduct'
import SpecialDetails from './components/Home/Special/SpecialDetails'
import FeaturedUpdateProduct from './pages/dashboard/FeaturedProduct/UpdateProduct/FeaturedUpdateProduct'
import OnlineAllProduct from './pages/dashboard/OnlineProduct/AllProduct/OnlineAllProduct'
import AddOnlineProduct from './pages/dashboard/OnlineProduct/AddProduct/AddOnlineProduct'
import OnlineUpdateProduct from './pages/dashboard/OnlineProduct/UpdateProduct/OnlineUpdateProduct'
import OnlineDetails from './components/Home/Online/OnlineDetails'
import Profile from './pages/Profile/Profile'

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
        <img src={logo} alt="Logo" className="splash-logo" />
        <Loading />
      </div>
    );
  }

  return (
    <>

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
              <Route path="/cart" element={<YourCart />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

      </Routes>

    </>
  )
}

export default App
