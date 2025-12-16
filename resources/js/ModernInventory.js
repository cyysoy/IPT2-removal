import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

function ModernInventory() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (shouldLoad = true) => {
        if (shouldLoad) setLoading(true);
        try {
            const response = await fetch("/api/products");
            const data = await response.json();
            const productList = data.data || [];
            const mappedProducts = productList.map((p) => ({
                id: p.id,
                name: p.product_name || p.name,
                description: p.description,
                price: p.price,
                quantity: p.stock_qty || p.quantity || 0,
            }));
            setProducts(mappedProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        }
        if (shouldLoad) setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = editId ? "update" : "add";
        if (!confirm(`Are you sure you want to ${action} this product?`))
            return;

        try {
            if (editId) {
                await fetch(`/api/products/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                alert("Product updated successfully!");
            } else {
                await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                alert("Product added successfully!");
            }

            setFormData({ name: "", description: "", price: "", quantity: "" });
            setEditId(null);
            fetchProducts(false);
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setLoading(true);
        try {
            await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            alert("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
        setLoading(false);
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
        });
        setEditId(product.id);
    };

    const handleCancel = () => {
        setFormData({ name: "", description: "", price: "", quantity: "" });
        setEditId(null);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h1>Product Inventory Management</h1>

            <div className="product-layout">
                <div className="product-table">
                    <h2>Product List</h2>
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            marginBottom: "10px",
                            padding: "8px",
                            width: "100%",
                        }}
                    />
                    {loading && <p>Loading...</p>}
                    {products.length === 0 && !loading && (
                        <p>
                            No products available. Add your first product on the
                            right.
                        </p>
                    )}
                    {products.length > 0 && (
                        <div className="table-card">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>{product.name}</td>
                                            <td>{product.description}</td>
                                            <td>
                                                ₱{formatPrice(product.price)}
                                            </td>
                                            <td>{product.quantity}</td>
                                            <td>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() =>
                                                        handleEdit(product)
                                                    }
                                                    disabled={loading}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                    disabled={loading}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="product-form">
                    <h2>{editId ? "Edit Product" : "Add New Product"}</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Product Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                        />
                        <div className="form-buttons">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {editId ? "Update" : "Add"}
                            </button>
                            {editId && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn-outline"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ModernInventory;

if (document.getElementById("products")) {
    ReactDOM.render(<ModernInventory />, document.getElementById("products"));
}
