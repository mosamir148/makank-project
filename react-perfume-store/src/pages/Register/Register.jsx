import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Login/Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../assets/url";

const Register = () => {
    const [active,setActive ] = useState(false);
     const [form , setForm] = useState({
        username:"",
        email:"",
        password:"",
        phone:""
    })
    const [image, setImage] = useState(null)
    const navigate = useNavigate()
    const handleChange = (e)=>{
        setForm({...form , [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();

        // VALIDATIONS
        if(!form.username || !form.email || !form.password || !form.phone ){
            toast.error("Please fill in all fields.")
            return
        }
        if(form.password.length < 8  ){
            toast.error("Password must be at least 8 characters")
            return
        }
        if(form.username.length < 3  ){
            toast.error("UserName must be at least 3 characters")
            return
        }
        if(form.phone.length !== 11  ){
            toast.error("Phone Number must be at 11 characters")
            return
        }

        // CREATE USER
        try{
            const formData = new FormData();
            formData.append("username", form.username);
            formData.append("email", form.email);
            formData.append("password", form.password);
            formData.append("phone", form.phone);
            if (image) {
            formData.append("image", image); 
        }
            await axios.post(`${BASE_URL}/user/signUp`, formData ,{ withCredentials: true })
            toast.success("Account Created Successfully")
            navigate("/signin")

        // HANDLE ERROE
        }catch(err){
            if (err.response) {
                if (err.response.status === 400) {
                toast.error(`Email already exists`);
                } else {
                toast.error(err.response.data.message || "Register failed");
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
          <h1 className="auth-logo">LUXE PARFUM</h1>
          <p className="auth-subtitle">مرحباً بك في عالم العطور الفاخرة</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="form-title">إنشاء حساب جديد</h2>

          <div className="form-group">
            <label className="form-label">الاسم الكامل</label>
            <input 
              value={form.username} 
              onChange={handleChange}
              name="username"
              type="text" 
              className="form-input" placeholder="أدخل اسمك الكامل" required />
          </div>

          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input 
              value={form.email} 
              onChange={handleChange}
              name="email"
              type="email" 
              className="form-input" placeholder="أدخل بريدك الإلكتروني" required />
          </div>

          <div className="form-group">
            <label className="form-label">رقم الهاتف</label>
            <input 
              value={form.phone} 
              onChange={handleChange}
              name="phone"
              type="tel" 
              className="form-input" 
              placeholder="05xxxxxxxx" required />
          </div>

           <div className="form-group">
            <label className="form-label"> كلمة المرور</label>
            <input 
              value={form.password} 
              onChange={handleChange}
              name="password"
             type={active ? "text" : "password"} className="form-input" placeholder="إدخال كلمة المرور" required />
                <span className="toggle-password" onClick={() => setActive(!active)}>
                    {active ? <FaEye /> : <FaEyeSlash />}  
                </span>
          </div>


          <button type="submit" className="submit-btn">إنشاء الحساب</button>

          <div className="form-footer">
            <p>لديك حساب بالفعل؟ <Link to="/login" className="form-link">تسجيل الدخول</Link></p>
          </div>
        </form>

       
      </div>
    </div>
  );
};

export default Register;
