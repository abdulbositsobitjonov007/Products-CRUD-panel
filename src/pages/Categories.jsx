import { useState } from "react";
import useGet from "../hooks/useGet";
import usePost from "../hooks/usePost";
import useDelete from "../hooks/useDelete";
import usePut from "../hooks/usePut";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Подключаем наши Хуки!
  const { data: categories, loading, refresh } = useGet("categories");
  const { postData, error: postError, loading: isPosting } = usePost("categories");
  const { putData, error: putError, loading: isPutting } = usePut("categories");
  const { deleteData } = useDelete("categories");

  // Форма по твоей схеме базы данных
  const initialForm = {
    categoryName: "",
    categoryImg: "",
    categorySlug: "",
    categoryDescription: ""
  };
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await putData(formData, editingCategory.id);
      } else {
        await postData(formData);
      }
      setIsModalOpen(false);
      setFormData(initialForm);
      setEditingCategory(null);
      refresh();
    } catch (err) {
      console.error("Category save error", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить категорию?")) {
      try {
        await deleteData(id);
        refresh();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setFormData({
      categoryName: category.categoryName || "",
      categoryImg: category.categoryImg || "",
      categorySlug: category.categorySlug || "",
      categoryDescription: category.categoryDescription || ""
    });
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const isLoadingAction = isPosting || isPutting;
  const currentError = postError || putError;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Loader */}
      {loading && <div className="text-center py-10 text-gray-500">Loading categories...</div>}

      {/* Grid Content */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(categories) && categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group flex flex-col h-full">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(category.id)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Delete">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Картинка из categoryImg, если нет - заглушка */}
              {category.categoryImg ? (
                <div className="w-16 h-16 rounded-lg mb-4">
                  <LazyLoadImage src={category.categoryImg} alt={category.categoryName} effect="blur" className="w-full h-full rounded-lg object-cover" />
                </div>) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-indigo-100 text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-800 mb-1">{category.categoryName}</h3>
              <p className="text-gray-500 text-xs font-mono mb-2">Slug: {category.categorySlug || 'none'}</p>
              <p className="text-gray-500 text-sm mb-4 line-clamp-3">{category.categoryDescription}</p>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                  {new Date(category.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {Array.isArray(categories) && categories.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No categories found. Click "Add Category" to create one.
            </div>
          )}
        </div>
      )}

      {/* Модальное окно */}
      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {currentError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    Error: {currentError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Electronics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Slug</label>
                  <input
                    type="text"
                    name="categorySlug"
                    value={formData.categorySlug}
                    onChange={handleChange}
                    required
                    placeholder="e.g. electronics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="categoryImg"
                    value={formData.categoryImg}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="categoryDescription"
                    value={formData.categoryDescription}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe this category..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoadingAction} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {isLoadingAction ? 'Saving...' : (editingCategory ? 'Update Category' : 'Save Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;