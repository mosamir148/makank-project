import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import "./AllProduct.css";
import { productsContext } from "../../../../context/GetProducts";
import { BASE_URL } from "../../../../assets/url";

const AllProduct = () => {
  const { product, setProducts } = useContext(productsContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async (page = 1) => {
    try {
      const res = await axios.get(`${BASE_URL}/product?page=${page}&limit=10`);
      setProducts(res.data.products);
      setTotalPages(Math.ceil(res.data.totalCount / 10));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const DelteProduct = async (id) => {
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
        await axios.delete(`${BASE_URL}/product/${id}`, { withCredentials: true });
        setProducts(product.filter((item) => item._id !== id));
        toast.success("Product Deleted Successfully!");
        Swal.fire("Deleted!", "Your product has been deleted.", "success");
      } catch (err) {
        console.log(err);
        toast.error("Failed to delete product!");
      }
    }
  };

  return (
    <section className="all-products-section">
      <div className="all-products-header">
        <h2>All Products</h2>
        <div className="all-products-search">
          <input type="search" placeholder="Search products..." />
        </div>
      </div>

      <div className="all-products-table-container">
        <table className="all-products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Category</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {product && product.length > 0 ? (
              product.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.title}
                      crossOrigin="anonymous"
                      loading="lazy"
                      className="product-avatar"
                    />
                  </td>
                  <td>{item.title}</td>
                  <td>${item.price}</td>
                  <td>${item.discount}</td>
                  <td>{item.category}</td>
                  <td className="text-center">
                    <Link className="edit-btn" to={`update-product/${item._id}`}>
                      Edit
                    </Link>
                    <button className="delete-btn" onClick={() => DelteProduct(item._id)}>
                      Delete
                    </button>
                    <Link className="show-btn" to={`/product/${item._id}`}>
                      Show
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages >= 1 ? totalPages : 0}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default AllProduct;
