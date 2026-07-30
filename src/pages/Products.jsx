import { useState } from "react";
import useGet from "../hooks/useGet";
import usePost from "../hooks/usePost";
import useDelete from "../hooks/useDelete";
import usePut from "../hooks/usePut";
import { MdOutlineStar } from "react-icons/md";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function Products() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Подключаем Хуки
    const { data: categories } = useGet("categories");
    const { data: products, loading, refresh } = useGet("products");
    const { postData, error: postError, loading: isPosting } = usePost("products");
    const { putData, error: putError, loading: isPutting } = usePut("products");
    const { deleteData } = useDelete("products");

    // Форма строго по твоей схеме (mockapi schema)
    const initialForm = {
        categoryId: "",
        productName: "",
        productImg: "",
        price: "",
        size: "",
        weight: "",
        calories: "",
        discount: "",
        isSpicy: false,
        isPopular: false,
        isVegetarian: false,
        rating: "",
        ingredients: "",
        productDescription: ""
    };
    
    const [formData, setFormData] = useState(initialForm);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData({ ...formData, [name]: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Преобразуем типы под схему API перед отправкой
        const submissionData = {
           ...formData,
           price: Number(formData.price) || 0,
           size: Number(formData.size) || 0,
           weight: Number(formData.weight) || 0,
           calories: Number(formData.calories) || 0,
           discount: Number(formData.discount) || 0,
           rating: Number(formData.rating) || 0,
           ingredients: formData.ingredients && typeof formData.ingredients === 'string' 
                ? formData.ingredients.split(',').map(s => s.trim()) 
                : (Array.isArray(formData.ingredients) ? formData.ingredients : [])
        };

        // MockAPI вложенный маршрут: /categories/:categoryId/products
        const nestedBaseUrl = `categories/${submissionData.categoryId}/products`;

        try {
            if (editingProduct) {
                // PUT /categories/:categoryId/products/:id
                await putData(submissionData, editingProduct.id, nestedBaseUrl);
            } else {
                // POST /categories/:categoryId/products
                await postData(submissionData, nestedBaseUrl);
            }
            setIsAddModalOpen(false);
            setFormData(initialForm);
            setEditingProduct(null);
            refresh();
        } catch (err) {
            console.error("Failed to save product", err);
        }
    };

    const handleDelete = async (product) => {
        if(window.confirm("Удалить продукт?")) {
            try {
                // MockAPI вложенный маршрут: DELETE /categories/:categoryId/products/:id
                const nestedBaseUrl = `categories/${product.categoryId}/products`;
                await deleteData(product.id, nestedBaseUrl);
                refresh();
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    const openAddModal = () => {
        setFormData(initialForm);
        setEditingProduct(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (product) => {
        setFormData({
            ...product,
            ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : (product.ingredients || "")
        });
        setEditingProduct(product);
        setIsAddModalOpen(true);
    };

    // Вспомогательная функция для получения названия категории
    const getCategoryName = (catId) => {
        if (!categories || !Array.isArray(categories)) return catId;
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.categoryName : 'Unknown';
    };

    const isLoadingAction = isPosting || isPutting;
    const currentError = postError || putError;

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your products, pricing and inventory.</p>
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Export
                    </button>
                    <button 
                        onClick={openAddModal} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Таблица продуктов */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Weight</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Calories</th>
                            <th scope="col" className="px-6 py-4 text-right font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && (
                            <tr>
                                <td colSpan="5" className="text-center py-6 text-gray-500">Loading products...</td>
                            </tr>
                        )}
                        {!loading && (!Array.isArray(products) || products.length === 0) && (
                            <tr>
                                <td colSpan="5" className="text-center py-6 text-gray-500">No products found.</td>
                            </tr>
                        )}

                        {!loading && Array.isArray(products) && products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="shrink-0  border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {product.productImg ? (
                                                <div className="h-10 w-10 rounded-lg">
                                                    <LazyLoadImage
                                                        src={product.productImg}
                                                        alt={product.productName}
                                                        effect="blur"
                                                        wrapperClassName="block h-full w-full"
                                                        className="block h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="font-semibold text-gray-900">{product.productName}</div>
                                            <div className="text-gray-500 text-xs mt-0.5">ID: {product.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md font-medium bg-gray-100 text-gray-700">
                                        {getCategoryName(product.categoryId)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        {product.isSpicy && <span title="Spicy" className="text-xl">🌶️</span>}
                                        {product.isVegetarian && <span title="Vegetarian" className="text-xl">🥗</span>}
                                        {product.isPopular && <span title="Popular" className="text-xl">⭐</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center font-semibold gap-1">
                                        {product.rating}
                                        <MdOutlineStar className="text-[#ffee00] text-[20px]" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold">{product.weight} g</td>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold">{product.calories} kcal</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    ${product.price}
                                    {product.discount > 0 && <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">-{product.discount}%</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-md hover:bg-indigo-100 transition-colors" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(product)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md hover:bg-red-100 transition-colors" title="Delete">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>

            {/* Модальное окно */}
            {isAddModalOpen && (
                <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm p-4 overflow-y-auto">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-lg w-full max-w-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
                            <h2 className="text-xl font-bold text-gray-800">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto max-h-[70vh]">
                                {currentError && (
                                    <div className="md:col-span-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                        Error: {currentError}
                                    </div>
                                )}
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input 
                                        type="text" 
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleChange}
                                        required 
                                        placeholder="e.g. Spicy Chicken Burger" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select 
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="" disabled>Select Category...</option>
                                        {Array.isArray(categories) && categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Numbers */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Size (units/cm)</label>
                                    <input type="number" name="size" value={formData.size} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g/kg)</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
                                    <input type="number" name="calories" value={formData.calories} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                    <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>

                                {/* Booleans / Badges */}
                                <div className="md:col-span-2 flex gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="isSpicy" checked={formData.isSpicy} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-medium text-gray-700">🌶️ Spicy</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="isVegetarian" checked={formData.isVegetarian} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-medium text-gray-700">🥗 Vegetarian</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-medium text-gray-700">⭐ Popular</span>
                                    </label>
                                </div>

                                {/* Text/Strings */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma separated)</label>
                                    <input 
                                        type="text" 
                                        name="ingredients"
                                        value={formData.ingredients}
                                        onChange={handleChange}
                                        placeholder="Tomato, Cheese, Onion..." 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input 
                                        type="url" 
                                        name="productImg"
                                        value={formData.productImg}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        name="productDescription"
                                        value={formData.productDescription}
                                        onChange={handleChange}
                                        rows="3" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoadingAction} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                                    {isLoadingAction ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;