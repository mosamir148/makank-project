import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import "./AllProduct.css";
import { productsContext } from "../../../../context/GetProducts";
import { BASE_URL } from "../../../../assets/url";
import Loading from "../../../../components/Loading/Loading";
import Pagination from "../../../../components/dashboard/Pagination/Pagination";
import { useLang } from "../../../../context/LangContext";
import { 
  FaBox, 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaDollarSign,
  FaTag,
  FaLayerGroup
} from "react-icons/fa";

const AllProduct = () => {
  const { t } = useLang();
  const { product, setProducts } = useContext(productsContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterCategory, setFilterCategory] = useState("all");
  const navigate = useNavigate();

  const fetchProducts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/product?page=${page}&limit=${limit}`);
      setProducts(res.data.products || []);
      setTotalPages(Math.ceil((res.data.totalCount || res.data.totalProducts || 0) / limit));
      setTotalItems(res.data.totalCount || res.data.totalProducts || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error(t("failedToLoad") || "Failed to load products");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = product
      .map((p) => p.category)
      .filter((cat, index, self) => cat && self.indexOf(cat) === index);
    return ["all", ...cats];
  }, [product]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...product];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "price" || sortBy === "discount") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
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
  }, [product, searchQuery, filterCategory, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = totalItems; // Use totalItems from API instead of product.length
    const totalValue = product.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const avgPrice = product.length > 0 ? totalValue / product.length : 0;
    const withDiscount = product.filter((p) => Number(p.discount) > 0).length;

    return { total, totalValue, avgPrice, withDiscount };
  }, [product, totalItems]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const DelteProduct = async (id) => {
    const result = await Swal.fire({
      title: t("confirm"),
      text: t("cannotUndo"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesDeleteProduct"),
      cancelButtonText: t("cancel"),
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/product/${id}`, { withCredentials: true });
        setProducts(product.filter((item) => item._id !== id));
        toast.success(t("productDeleted"));
        Swal.fire(t("deleted"), t("productDeleted").replace("!", "."), "success");
        fetchProducts(currentPage, pageSize);
      } catch (err) {
        console.log(err);
        toast.error(t("failedToDelete") + " " + t("adminProducts"));
      }
    }
  };

  if (loading && product.length === 0) return <Loading />;

  return (
    <section className="all-products-section">
      {/* Header Section */}
      <div className="all-products-header">
        <div className="header-content">
          <div className="header-title">
            <FaBox className="header-icon" />
            <h2>{t("allProducts")}</h2>
          </div>
          <Link to="/dashboard/products/add-product" className="add-product-btn">
            <FaPlus />
            <span>{t("addNewProduct")}</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="products-stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <FaBox />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>{t("totalProducts") || "Total Products"}</p>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <FaDollarSign />
          </div>
          <div className="stat-content">
            <h3>{stats.avgPrice.toFixed(2)}</h3>
            <p>{t("averagePrice") || "Average Price"}</p>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <FaTag />
          </div>
          <div className="stat-content">
            <h3>{stats.withDiscount}</h3>
            <p>{t("withDiscount") || "With Discount"}</p>
          </div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <FaLayerGroup />
          </div>
          <div className="stat-content">
            <h3>{categories.length - 1}</h3>
            <p>{t("categories") || "Categories"}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="products-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t("searchProducts") || "Search products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? t("allCategories") || "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="all-products-table-container">
        <table className="all-products-table">
          <thead>
            <tr>
              <th>{t("productImage")}</th>
              <th 
                className="sortable" 
                onClick={() => handleSort("title")}
              >
                <div className="th-content">
                  {t("productName")}
                  {sortBy === "title" && (
                    sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />
                  )}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort("price")}
              >
                <div className="th-content">
                  {t("productPrice")}
                  {sortBy === "price" && (
                    sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />
                  )}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort("category")}
              >
                <div className="th-content">
                  {t("productCategory")}
                  {sortBy === "category" && (
                    sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />
                  )}
                </div>
              </th>
              <th className="text-center actions-column">{t("userActions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-row">
                  <Loading />
                </td>
              </tr>
            ) : filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((item) => (
                <tr 
                  key={item._id}
                  onClick={() => navigate(`/dashboard/products/${item._id}`)}
                  className="product-row-clickable"
                >
                  <td>
                    <div className="product-image-wrapper">
                      <img
                        src={item.image}
                        alt={item.title}
                        crossOrigin="anonymous"
                        loading="lazy"
                        className="product-avatar"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/60?text=No+Image";
                        }}
                      />
                    </div>
                  </td>
                  <td className="product-name-cell">
                    <strong>{item.title}</strong>
                    {item.brand && <span className="product-brand">{item.brand}</span>}
                  </td>
                  <td className="price-cell">
                    <span className="price-value">{Number(item.price || 0).toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="category-badge">{item.category || "—"}</span>
                  </td>
                  <td className="text-center actions-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button 
                        type="button"
                        className="action-btn view-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/products/${item._id}`);
                        }}
                        title={t("view")}
                        aria-label={t("view")}
                      >
                        <FaEye />
                      </button>
                      <Link 
                        className="action-btn edit-btn" 
                        to={`/dashboard/products/update-product/${item._id}`}
                        onClick={(e) => e.stopPropagation()}
                        title={t("edit")}
                        aria-label={t("edit")}
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        type="button"
                        className="action-btn delete-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          DelteProduct(item._id);
                        }}
                        title={t("delete")}
                        aria-label={t("delete")}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="empty-state-content">
                    <FaBox className="empty-icon" />
                    <p>{searchQuery || filterCategory !== "all" ? t("noProductsFound") || "No products found" : t("noProducts")}</p>
                    {searchQuery && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => {
                          setSearchQuery("");
                          setFilterCategory("all");
                        }}
                      >
                        Clear filters
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
      {filteredAndSortedProducts.length > 0 && (
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
};

export default React.memo(AllProduct);
