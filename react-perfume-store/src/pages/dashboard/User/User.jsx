import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import "./User.css";
import { BASE_URL } from "../../../assets/url";

function User() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  const [select, setSelect] = useState(false);
  const [search, setSearch] = useState("");

  const GetUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getUsers`, { withCredentials: true });
      setUsers(res.data.Users);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    GetUsers();
  }, []);

  const getUser = async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getUser/${id}`, { withCredentials: true });
      setUser(res.data.info);
      setSelect(true);
    } catch (err) {
      console.log(err);
    }
  };

  const DeleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/user/delete/${id}`, { withCredentials: true });
        toast.success("User Deleted Successfully!");
        GetUsers();
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const filterUser = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="all-users-container">
      <div className="all-users-header">
        <h2>All Users</h2>
        <div className="search-wrapper">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
          />
        </div>
      </div>

      <div className="all-users-table-container">
        <table className="all-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th >Actions</th>
            </tr>
          </thead>

            <tbody>
                {filterUser.length === 0 && (
                    <tr>
                    <td colSpan={4} className="no-users">
                        No users found.
                    </td>
                    </tr>
                )}
                {filterUser.map((user, index) => (
                    <tr key={index}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td  className="actions-cell">
                        <div className="actions-wrapper">
                        <button className="action-btn" onClick={() => getUser(user._id)}>View</button>
                        <button className="delete-btn" onClick={() => DeleteUser(user._id)}>Delete</button>
                        </div>
                    </td>
                    </tr>
                ))}
            </tbody>

        </table>
      </div>

      {select && (
        <div className="user-modal">
          <div className="user-modal-header">
            <h3>User Details</h3>
            <button onClick={() => setSelect(false)}>✕</button>
          </div>
          <div className="user-modal-body">
            <div className="user-info"><span>Username:</span> {user.username}</div>
            <div className="user-info"><span>Email:</span> {user.email}</div>
            <div className="user-info"><span>Phone:</span> {user.phone}</div>
            <div className="user-info"><span>Role:</span> {user.role}</div>
            <div className="user-info"><span>CreatedAt:</span> {new Date(user.createdAt).toLocaleString()}</div>
            <div className="user-info"><span>UpdatedAt:</span> {new Date(user.updatedAt).toLocaleString()}</div>
          </div>
        </div>
        
      )}
    </div>
  );
}

export default User;

