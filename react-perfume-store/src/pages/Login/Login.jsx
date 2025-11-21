import React, { use, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { userContext } from "../../context/UserContext";
import { BASE_URL } from "../../assets/url";
import toast from "react-hot-toast";
import axios from "axios";
import { useLang } from "../../context/LangContext";

const Login = () => {
    const [active,setActive ] = useState(false);
    const [password,setPassword] = useState("")
    const [email,setEmail] = useState("")
    const navigate = useNavigate()
    const {setUser} = useContext(userContext)
    const {t} = useLang()
    const handleSubmit = async (e)=>{
        e.preventDefault();
        // SIGNED USER 
        try{
            const res = await axios.post(`${BASE_URL}/user/login`,{password,email},{ withCredentials: true })
            
            // Store token in localStorage for axios interceptor
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            
            // Clear any old cart items from localStorage to prevent showing previous user's items
            // Items will be loaded from database for the logged-in user
            localStorage.removeItem('localWish')
            localStorage.removeItem('guestWishlist')
            
            setUser(res.data.info)
            toast.success("Logged Successfully")
            navigate("/")
        // HANDLE ERROR
        }catch(err){
            if (err.response) {
        if (err.response.status === 401) {
          toast.error("Incorrect Password Or Email");
        } else if (err.response.status === 404) {
          toast.error("Email and Password are required");
        } else {
          toast.error("Login failed");
        }
      } else {
        toast.error("An unexpected error occurred");
        console.log(err);
      }
    }
    }

  return (
     <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">Makanak</h1>
          <p className="auth-subtitle">{t("authSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="form-title">{t("loginTitle")}</h2>

          <div className="form-group">
            <label className="form-label">{t("emailLabel")}</label>
            <input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" 
              className="form-input" 
              placeholder={t("emailPlaceholder")} 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("passwordLabel")}</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={active ? "text" : "password"} 
              className="form-input" 
              placeholder={t("passwordPlaceholder")} 
              required
            />
            <span className="toggle-password" onClick={() => setActive(!active)}>
              {active ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <button type="submit" className="submit-btn">{t("loginButton")}</button>

          <div className="form-footer">
            <p>{t("noAccount")} <Link to="/register" className="form-link">{t("registerLink")}</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(Login);
