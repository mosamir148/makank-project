import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import "./User.css";
import { BASE_URL } from "../../../assets/url";
import Loading from "../../../components/Loading/Loading";

function User() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  const [select, setSelect] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const GetUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getUsers`, { withCredentials: true });
      setUsers(res.data.Users);
      setLoading(false)
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
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذف المستخدم!",
      cancelButtonText: "إلغاء",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/user/delete/${id}`, { withCredentials: true });
        toast.success("تم حذف المستخدم بنجاح!");
        GetUsers();
        Swal.fire("تم الحذف!", "تم حذف المستخدم بنجاح.", "success");
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

  if(loading) return <Loading />

  return (
    <div className="all-users-container">
      <div className="all-users-header">
        <h2>جميع المستخدمين</h2>
        <div className="search-wrapper">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          />
        </div>
      </div>

      <div className="all-users-table-container">
        <table className="all-users-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filterUser.length === 0 && (
              <tr>
                <td colSpan={4} className="no-users">
                  لم يتم العثور على مستخدمين.
                </td>
              </tr>
            )}
            {filterUser.map((user, index) => (
              <tr key={index}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td className="actions-cell">
                  <div className="actions-wrapper">
                    <button className="action-btn" onClick={() => getUser(user._id)}>عرض</button>
                    <button className="delete-btn" onClick={() => DeleteUser(user._id)}>حذف</button>
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
            <h3>تفاصيل المستخدم</h3>
            <button onClick={() => setSelect(false)}>✕</button>
          </div>
          <div className="user-modal-body">
            <div className="user-info"><span>الاسم:</span> {user.username}</div>
            <div className="user-info"><span>البريد الإلكتروني:</span> {user.email}</div>
            <div className="user-info"><span>الهاتف:</span> {user.phone}</div>
            <div className="user-info"><span>الدور:</span> {user.role}</div>
            <div className="user-info"><span>تاريخ الإنشاء:</span> {new Date(user.createdAt).toLocaleString()}</div>
            <div className="user-info"><span>آخر تعديل:</span> {new Date(user.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(User);
