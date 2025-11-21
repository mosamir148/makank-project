import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./User.css";
import { BASE_URL } from "../../../assets/url";
import Loading from "../../../components/Loading/Loading";
import Pagination from "../../../components/dashboard/Pagination/Pagination";
import { useLang } from "../../../context/LangContext";
import { 
  FaUsers, 
  FaSearch, 
  FaEye, 
  FaTrash, 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone, 
  FaUser,
  FaUserShield,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
  FaUserCheck
} from "react-icons/fa";

function User() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterRole, setFilterRole] = useState("all");
  const navigate = useNavigate();

  const GetUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/user/getUsers`, { 
        withCredentials: true,
        params: { page, limit }
      });
      setUsers(res.data.Users || []);
      setTotalPages(Math.ceil((res.data.totalCount || 0) / limit));
      setTotalItems(res.data.totalCount || 0);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
      toast.error(t("failedToLoadUsers") || "Failed to load users");
    }
  };

  useEffect(() => {
    GetUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Get unique roles
  const roles = useMemo(() => {
    const roleList = users
      .map((u) => u.role)
      .filter((role, index, self) => role && self.indexOf(role) === index);
    return ["all", ...roleList];
  }, [users]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((item) => item.role === filterRole);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [users, searchQuery, filterRole, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = totalItems;
    const admins = users.filter((u) => u.role === "admin").length;
    const regularUsers = users.filter((u) => u.role === "user" || !u.role).length;
    const newThisMonth = users.filter((u) => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    return { total, admins, regularUsers, newThisMonth };
  }, [users, totalItems]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const DeleteUser = async (id) => {
    const result = await Swal.fire({
      title: t("confirm"),
      text: t("cannotUndo"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesDeleteUser"),
      cancelButtonText: t("cancel"),
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/user/delete/${id}`, { withCredentials: true });
        setUsers(users.filter((item) => (item._id || item.publicId) !== id));
        toast.success(t("userDeleted"));
        Swal.fire(t("deleted"), t("userDeletedSuccess") || t("userDeleted"), "success");
        GetUsers(currentPage, pageSize);
      } catch (err) {
        console.log(err);
        toast.error(t("failedToDeleteUser") || "Failed to delete user");
      }
    }
  };

  // Get user initials for avatar
  const getUserInitials = (username) => {
    if (!username) return "?";
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for avatar based on username
  const getAvatarColor = (username) => {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    ];
    if (!username) return colors[0];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading && users.length === 0) return <Loading />;

  return (
    <section className="all-users-section">
      {/* Header Section */}
      <div className="all-users-header">
        <div className="header-content">
          <div className="header-title">
            <FaUsers className="header-icon" />
            <h2>{t("allUsers") || "All Users"}</h2>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="users-stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>{t("totalUsers") || "Total Users"}</p>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <FaUserCheck />
          </div>
          <div className="stat-content">
            <h3>{stats.regularUsers}</h3>
            <p>{t("regularUsers") || "Regular Users"}</p>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <FaUserShield />
          </div>
          <div className="stat-content">
            <h3>{stats.admins}</h3>
            <p>{t("admins") || "Admins"}</p>
          </div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <FaUserCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.newThisMonth}</h3>
            <p>{t("newThisMonth") || "New This Month"}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="users-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t("searchUsers") || "Search users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === "all" ? t("allRoles") || "All Roles" : role === "admin" ? t("admin") || "Admin" : t("user") || "User"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="all-users-table-container">
        <table className="all-users-table">
          <thead>
            <tr>
              <th>{t("userImage")}</th>
              <th 
                className="sortable" 
                onClick={() => handleSort("username")}
              >
                <div className="th-content">
                  {t("userName")}
                  {sortBy === "username" && (
                    sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />
                  )}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort("email")}
              >
                <div className="th-content">
                  {t("userEmail")}
                  {sortBy === "email" && (
                    sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />
                  )}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort("phone")}
              >
                <div className="th-content">
                  {t("userPhone")}
                  {sortBy === "phone" && (
                    sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />
                  )}
                </div>
              </th>
              <th>{t("userRole")}</th>
              <th className="text-center actions-column">{t("userActions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-row">
                  <Loading />
                </td>
              </tr>
            ) : filteredAndSortedUsers.length > 0 ? (
              filteredAndSortedUsers.map((user, index) => {
                const handleRowClick = (e) => {
                  // Don't navigate if clicking on action buttons
                  if (e.target.closest('.actions-cell') || e.target.closest('.action-btn')) {
                    return;
                  }
                  // Get user ID - try _id first, then publicId as fallback
                  const userId = user._id || user.publicId;
                  if (userId) {
                    const path = `/dashboard/user/${userId}`;
                    console.log('Navigating to user:', userId, 'Path:', path);
                    navigate(path);
                  } else {
                    console.warn('User ID is missing:', user);
                    toast.error(t("userIdMissing") || "User ID is missing");
                  }
                };

                // Get user ID for key and navigation
                const userId = user._id || user.publicId || `user-${index}`;
                
                return (
                <tr 
                  key={userId}
                  onClick={handleRowClick}
                  className="user-row-clickable"
                >
                  <td>
                    <div className="user-avatar-wrapper">
                      <div 
                        className="user-avatar" 
                        style={{ background: getAvatarColor(user.username) }}
                      >
                        {getUserInitials(user.username)}
                      </div>
                    </div>
                  </td>
                  <td className="user-name-cell">
                    <strong>{user.username || "—"}</strong>
                  </td>
                  <td className="email-cell">
                    <div className="email-info">
                      <FaEnvelope className="cell-icon" />
                      <span>{user.email || "—"}</span>
                    </div>
                  </td>
                  <td className="phone-cell">
                    <div className="phone-info">
                      <FaPhone className="cell-icon" />
                      <span>{user.phone || "—"}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role === "admin" ? "role-admin" : "role-user"}`}>
                      {user.role === "admin" ? t("admin") || "Admin" : t("user") || "User"}
                    </span>
                  </td>
                  <td className="text-center actions-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button 
                        type="button"
                        className="action-btn view-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const userId = user._id || user.publicId;
                          if (userId) {
                            const path = `/dashboard/user/${userId}`;
                            console.log('View button clicked - Navigating to user:', userId, 'Path:', path);
                            navigate(path);
                          } else {
                            console.warn('View button clicked but user ID is missing:', user);
                            toast.error(t("userIdMissing") || "User ID is missing");
                          }
                        }}
                        title={t("view")}
                        aria-label={t("view")}
                      >
                        <FaEye />
                      </button>
                      <button 
                        type="button"
                        className="action-btn delete-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const userId = user._id || user.publicId;
                          if (userId) {
                            DeleteUser(userId);
                          } else {
                            toast.error(t("userIdMissing") || "User ID is missing");
                          }
                        }}
                        title={t("delete")}
                        aria-label={t("delete")}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-state-content">
                    <FaUserCircle className="empty-icon" />
                    <p>{searchQuery || filterRole !== "all" ? t("noUsersFound") || "No users found" : t("noUsers") || "No users"}</p>
                    {searchQuery && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => {
                          setSearchQuery("");
                          setFilterRole("all");
                        }}
                      >
                        {t("clearFilters") || "Clear filters"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAndSortedUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalItems={totalItems}
        />
      )}
    </section>
  );
}

export default React.memo(User);
