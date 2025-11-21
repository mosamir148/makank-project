import { FaBarsProgress } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
const logo = "/assets/Logo3.png";
import React, { useContext } from "react";
import toast from "react-hot-toast";
import "./DashboardNavbar.css";
import { FaBars } from "react-icons/fa";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
import NotificationBell from "../../Notification/NotificationBell";

const DashboardNavbar = ({ active, setActive }) => {
const {setUser} = useContext(userContext)
  const navigate = useNavigate()

    const handleLogOut = async ()=>{
        try{
            await axios.get(`${BASE_URL}/user/logout`)
            // Clear token from localStorage
            localStorage.removeItem('token')
            setUser(null)
            navigate("/signin")
            toast.success("Logged Out Successfully")
        }catch(err){
            console.log(err)
            // Clear token even if logout request fails
            localStorage.removeItem('token')
        }
    }

  return (
     <nav className="dashboard-navbar">
      <div className="navbar-left">
        <img src={logo} alt="Makanak Logo" loading="lazy" className="logo-img" />
       
      {/* <FaBars
          onClick={() => setActive(!active)}
          className={`menu-icon ${active ? "rotate" : ""}`}
        />*/}
      </div>
      <div className="navbar-right">
        <NotificationBell />
        <Link to="/">Home</Link>
        <button onClick={handleLogOut} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default React.memo(DashboardNavbar);
