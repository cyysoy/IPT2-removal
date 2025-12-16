import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return "₱0.00";
    return "₱" + num.toFixed(2);
};

const ModernInventory = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/products");
            const data = await response.json();

            const list = data.data || data || [];

            setProducts(
                list.map((p) => ({
                    id: p.id,
                    name: p.product_name || p.name,
                    description: p.description || "",
                    price: p.price,
                    quantity: p.stock_qty ?? p.quantity ?? 0,
                }))
            );
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setProducts([]);
        }
        setLoading(false);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            quantity: "",
        });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
        });
    };

    const handleCancel = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            quantity: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEdit = Boolean(editingProduct);
        const actionText = isEdit ? "update" : "add";

        if (!confirm(`Are you sure you want to ${actionText} this product?`))
            return;

        try {
            const url = isEdit
                ? `/api/products/${editingProduct.id}`
                : "/api/products";

            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            await fetchProducts();
            handleCancel();
        } catch (error) {
            console.error("Error submitting product:", error);
            alert("Something went wrong while saving the product.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Delete failed");
            }

            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product.");
        }
        setLoading(false);
    };

    /**
     * Render
     */
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

                    {!loading && filteredProducts.length === 0 && (
                        <p>No products found.</p>
                    )}

                    {!loading && filteredProducts.length > 0 && (
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
                                            <td>
                                                {product.description || "-"}
                                            </td>
                                            <td>
                                                {formatPrice(product.price)}
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
                    <h2>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                    </h2>

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
                                {editingProduct ? "Update" : "Add"}
                            </button>

                            {editingProduct && (
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
};

export default ModernInventory;

if (document.getElementById("products")) {
    ReactDOM.render(<ModernInventory />, document.getElementById("products"));
}
