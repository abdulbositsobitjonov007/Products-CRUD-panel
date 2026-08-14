// ============================================================
// Products.jsx — Страница управления продуктами (CRUD)
//
// АРХИТЕКТУРА этого файла:
//   1. useGet        — READ: загружает список продуктов и категорий с сервера
//   2. usePost       — CREATE: создаёт новый продукт
//   3. usePut        — UPDATE: обновляет существующий продукт
//   4. useDelete     — DELETE: удаляет продукт
//   5. useForm       — управляет всеми полями формы (React Hook Form)
//   6. yupResolver   — связывает форму со схемой Yup (валидация)
//   7. productSchema — правила проверки данных (что обязательно, какой тип и т.д.)
//
// ПОТОК ДАННЫХ:
//   Пользователь заполняет форму → React Hook Form собирает данные
//   → yupResolver проверяет по productSchema → если OK → onSubmit
//   → usePost/usePut отправляет на сервер → refresh() обновляет список
// ============================================================

import { useState, useEffect } from "react";

// ── Хуки для CRUD-запросов ──────────────────────────────────
import useGet from "../hooks/useGet";          // GET (Read)
import usePost from "../hooks/usePost";        // POST (Create)
import useDelete from "../hooks/useDelete";    // DELETE (Delete)
import usePut from "../hooks/usePut";          // PUT (Update)

// ── React Hook Form ─────────────────────────────────────────
// useForm    — основной хук: даёт register, handleSubmit, reset, errors и т.д.
// Controller — обёртка для полей, которые не являются обычными input (checkbox и др.)
import { useForm, Controller } from "react-hook-form";

// ── Yup + resolver ──────────────────────────────────────────
// yupResolver — "мост" между React Hook Form и Yup-схемой
import { yupResolver } from "@hookform/resolvers/yup";

// Наша схема валидации (правила для каждого поля)
import { productSchema } from "../validation/productSchema";

// ── UI иконки ───────────────────────────────────────────────
import { MdOutlineStar } from "react-icons/md";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";


function Products() {
    // ── Состояние модального окна ────────────────────────────
    // isAddModalOpen — true = модальное окно открыто
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // editingProduct — null = режим создания, объект = режим редактирования
    const [editingProduct, setEditingProduct] = useState(null);

    // ─────────────────────────────────────────────────────────
    // READ: Получение данных с сервера через хуки
    // useGet("categories") отправит GET /categories на MockAPI
    // useGet("products")   отправит GET /products  на MockAPI
    // ─────────────────────────────────────────────────────────
    const { data: categories } = useGet("categories");
    const { data: products, loading, refresh } = useGet("products");
    // refresh() — вызывается после create/update/delete чтобы перезагрузить список

    // ─────────────────────────────────────────────────────────
    // CREATE: Хук для POST-запроса (создание нового продукта)
    // ─────────────────────────────────────────────────────────
    const { postData, error: postError, loading: isPosting } = usePost("products");

    // ─────────────────────────────────────────────────────────
    // UPDATE: Хук для PUT-запроса (полное обновление продукта)
    // ─────────────────────────────────────────────────────────
    const { putData, error: putError, loading: isPutting } = usePut("products");

    // ─────────────────────────────────────────────────────────
    // DELETE: Хук для DELETE-запроса (удаление продукта)
    // ─────────────────────────────────────────────────────────
    const { deleteData } = useDelete("products");

    // ─────────────────────────────────────────────────────────
    // REACT HOOK FORM — инициализация
    //
    // useForm() возвращает набор утилит для управления формой:
    //   register      — привязывает <input> к полю формы по имени
    //   handleSubmit  — обёртка над onSubmit: сначала запускает валидацию Yup,
    //                   при успехе вызывает нашу функцию с чистыми данными
    //   reset         — сбрасывает или заполняет форму новыми значениями
    //   control       — нужен для Controller (checkbox, select с кастомным поведением)
    //   formState     — объект с метаданными:
    //     errors        — ошибки валидации по каждому полю
    //     isSubmitting  — true пока идёт отправка (блокирует кнопку)
    // ─────────────────────────────────────────────────────────
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting }, } = useForm({
        // resolver — подключаем нашу Yup схему вместо встроенной RHF валидации
        resolver: yupResolver(productSchema),
        // Значения по умолчанию для пустой формы (при создании нового продукта)
        defaultValues: {
            categoryId: "",
            productName: "",
            productImg: "",
            price: "",
            size: "",
            weight: "",
            calories: "",
            discount: 0,
            isSpicy: false,
            isPopular: false,
            isVegetarian: false,
            rating: 0,
            ingredients: "",
            productDescription: "",
        },
    });

    // ─────────────────────────────────────────────────────────
    // Автозаполнение формы в режиме редактирования
    //
    // useEffect следит за editingProduct.
    // Когда пользователь кликает "Edit" в таблице → editingProduct становится
    // объектом продукта → reset() заполняет все поля этими данными.
    // При создании editingProduct = null → сбрасываем к defaultValues.
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (editingProduct) {
            // Заполняем форму данными редактируемого продукта
            reset({
                categoryId: editingProduct.categoryId || "",
                productName: editingProduct.productName || "",
                productImg: editingProduct.productImg || "",
                price: editingProduct.price || "",
                size: editingProduct.size || "",
                weight: editingProduct.weight || "",
                calories: editingProduct.calories || "",
                discount: editingProduct.discount || 0,
                isSpicy: editingProduct.isSpicy || false,
                isPopular: editingProduct.isPopular || false,
                isVegetarian: editingProduct.isVegetarian || false,
                rating: editingProduct.rating || 0,
                // Массив ингредиентов объединяем обратно в строку для textarea
                ingredients: Array.isArray(editingProduct.ingredients)
                    ? editingProduct.ingredients.join(", ")
                    : (editingProduct.ingredients || ""),
                productDescription: editingProduct.productDescription || "",
            });
        } else {
            // Режим создания — очищаем форму к начальным значениям
            reset({
                categoryId: "", productName: "", productImg: "",
                price: "", size: "", weight: "", calories: "",
                discount: 0, isSpicy: false, isPopular: false,
                isVegetarian: false, rating: 0,
                ingredients: "", productDescription: "",
            });
        }
    }, [editingProduct, reset]);

    // ─────────────────────────────────────────────────────────
    // handleSubmit (обёртка RHF) вызывает эту функцию ТОЛЬКО
    // если все правила Yup проверены успешно.
    // validData — данные уже прошедшие валидацию (числа — числа, строки — строки)
    // ─────────────────────────────────────────────────────────
    const onSubmit = async (validData) => {
        // Преобразуем строку ингредиентов "Томат, Сыр" → массив ["Томат", "Сыр"]
        // Сервер (MockAPI) ожидает массив строк, а не строку
        const submissionData = {
            ...validData,
            ingredients: validData.ingredients && typeof validData.ingredients === "string"
                ? validData.ingredients.split(",").map((s) => s.trim()).filter(Boolean)
                : [],
        };

        // Путь для вложенного маршрута MockAPI:
        // POST   /categories/:categoryId/products
        // PUT    /categories/:categoryId/products/:id
        const nestedBaseUrl = `categories/${submissionData.categoryId}/products`;

        try {
            if (editingProduct) {
                // ── UPDATE: PUT /categories/:catId/products/:id ──
                await putData(submissionData, editingProduct.id, nestedBaseUrl);
            } else {
                // ── CREATE: POST /categories/:catId/products ─────
                await postData(submissionData, nestedBaseUrl);
            }
            // Успешно — закрываем модалку и обновляем список
            setIsAddModalOpen(false);
            setEditingProduct(null);
            refresh(); // повторный GET /products для обновления таблицы
        } catch (err) {
            // Ошибка уже логируется внутри хука, здесь можно показать тост
            console.error("Failed to save product:", err);
        }
    };

    // ─────────────────────────────────────────────────────────
    // DELETE: Подтверждение и удаление продукта
    // ─────────────────────────────────────────────────────────
    const handleDelete = async (product) => {
        if (window.confirm("Удалить продукт?")) {
            try {
                // DELETE /categories/:categoryId/products/:id
                const nestedBaseUrl = `categories/${product.categoryId}/products`;
                await deleteData(product.id, nestedBaseUrl);
                refresh(); // обновляем список после удаления
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    // ── Открыть модалку для создания ─────────────────────────
    const openAddModal = () => {
        setEditingProduct(null);      // сбрасываем редактируемый продукт
        setIsAddModalOpen(true);      // открываем модалку
        // reset() вызовется автоматически в useEffect выше
    };

    // ── Открыть модалку для редактирования ───────────────────
    const openEditModal = (product) => {
        setEditingProduct(product);   // сохраняем продукт → useEffect заполнит форму
        setIsAddModalOpen(true);      // открываем модалку
    };

    // ── Вспомогательная функция: получить название категории по id ──
    const getCategoryName = (catId) => {
        if (!categories || !Array.isArray(categories)) return catId;
        const cat = categories.find((c) => c.id === catId);
        return cat ? cat.categoryName : "Unknown";
    };

    // Флаги для управления состоянием формы
    const isLoadingAction = isPosting || isPutting;    // идёт ли POST или PUT
    const currentError = postError || putError;        // ошибка от сервера

    // ──────────────────────────────────────────────────────────
    // JSX — рендеринг
    // ──────────────────────────────────────────────────────────
    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen relative">

            {/* ── Заголовок страницы ─────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                </div>
                <div className="flex w-full md:w-auto gap-3">
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

            {/* ── Таблица продуктов (READ) ────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Weight</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Calories</th>
                            <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-4 text-right font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Состояние загрузки */}
                        {loading && (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-gray-500">Loading products...</td>
                            </tr>
                        )}
                        {/* Пустой список */}
                        {!loading && (!Array.isArray(products) || products.length === 0) && (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-gray-500">No products found.</td>
                            </tr>
                        )}

                        {/* Список продуктов — рендерим строку для каждого продукта */}
                        {!loading && Array.isArray(products) && products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {product.productImg ? (
                                                <div className="h-10 w-10 rounded-lg">
                                                    {/* LazyLoadImage — ленивая загрузка изображения (загружается только когда видимо) */}
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
                                    {product.discount > 0 && (
                                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                            -{product.discount}%
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Кнопка редактирования — передаёт продукт в openEditModal */}
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-md hover:bg-indigo-100 transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        {/* Кнопка удаления — вызывает handleDelete с confirm() */}
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md hover:bg-red-100 transition-colors"
                                            title="Delete"
                                        >
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

            {/* ── Модальное окно с формой ─────────────────────── */}
            {isAddModalOpen && (
                // Клик по фону (overlay) — закрывает модалку
                <div
                    onClick={() => setIsAddModalOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm p-4 overflow-y-auto"
                >
                    {/* e.stopPropagation() — предотвращает закрытие при клике внутри модалки */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl shadow-lg w-full max-w-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
                    >
                        {/* ── Заголовок модалки ──────────────────────── */}
                        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingProduct ? "Edit Product" : "Add New Product"}
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* ─────────────────────────────────────────────
                            ФОРМА — React Hook Form
                            handleSubmit(onSubmit):
                              1. Перехватывает submit события
                              2. Запускает Yup валидацию через yupResolver
                              3. Если данные валидны → вызывает onSubmit(validData)
                              4. Если есть ошибки → заполняет errors, НЕ вызывает onSubmit
                        ───────────────────────────────────────────── */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto max-h-[70vh]">

                                {/* Ошибка от сервера (не валидация, а сетевая ошибка) */}
                                {currentError && (
                                    <div className="md:col-span-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                        Server Error: {currentError}
                                    </div>
                                )}

                                {/* ── Название продукта ──────────────────────
                                    {...register("productName")} — привязывает этот input
                                    к полю "productName" в React Hook Form.
                                    RHF сам отслеживает onChange, value, ref — нам не нужен handleChange!
                                ─────────────────────────────────────────── */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name
                                    </label>
                                    <input
                                        {...register("productName")}
                                        type="text"
                                        placeholder="e.g. Spicy Chicken Burger"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.productName ? "border-red-400 bg-red-50" : "border-gray-300"
                                            }`}
                                    />
                                    {/* errors.productName?.message — текст ошибки из Yup схемы */}
                                    {errors.productName && (
                                        <p className="mt-1 text-xs text-red-500">{errors.productName.message}</p>
                                    )}
                                </div>

                                {/* ── Категория ──────────────────────────────
                                    Для <select> register работает так же как для <input>
                                ─────────────────────────────────────────── */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        {...register("categoryId")}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.categoryId ? "border-red-400 bg-red-50" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="" disabled>Select Category...</option>
                                        {/* Выводим список категорий из MockAPI */}
                                        {Array.isArray(categories) && categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                                        ))}
                                    </select>
                                    {errors.categoryId && (
                                        <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
                                    )}
                                </div>

                                {/* ── Цена ─────────────────────────────────── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        {...register("price")}
                                        type="number"
                                        step="0.01"
                                        className={`w-full px-3 py-2 border rounded-lg ${errors.price ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                    />
                                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                                </div>

                                {/* ── Размер ───────────────────────────────── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Size (units/cm)</label>
                                    <input
                                        {...register("size")}
                                        type="number"
                                        className={`w-full px-3 py-2 border rounded-lg ${errors.size ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                    />
                                    {errors.size && <p className="mt-1 text-xs text-red-500">{errors.size.message}</p>}
                                </div>

                                {/* ── Вес ──────────────────────────────────── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g/kg)</label>
                                    <input
                                        {...register("weight")}
                                        type="number"
                                        className={`w-full px-3 py-2 border rounded-lg ${errors.weight ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                    />
                                    {errors.weight && <p className="mt-1 text-xs text-red-500">{errors.weight.message}</p>}
                                </div>

                                {/* ── Калории ──────────────────────────────── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
                                    <input
                                        {...register("calories")}
                                        type="number"
                                        className={`w-full px-3 py-2 border rounded-lg ${errors.calories ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                    />
                                    {errors.calories && <p className="mt-1 text-xs text-red-500">{errors.calories.message}</p>}
                                </div>

                                {/* ── Скидка ───────────────────────────────── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                    <input
                                        {...register("discount")}
                                        type="number"
                                        className={`w-full px-3 py-2 border rounded-lg ${errors.discount ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                    />
                                    {errors.discount && <p className="mt-1 text-xs text-red-500">{errors.discount.message}</p>}
                                </div>

                                {/* ── Рейтинг ──────────────────────────────── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                                    <input
                                        {...register("rating")}
                                        type="number"
                                        step="0.1"
                                        className={`w-full px-3 py-2 border rounded-lg ${errors.rating ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                    />
                                    {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>}
                                </div>

                                {/* ─── Checkbox-поля через Controller ────────────
                                    Controller — компонент-обёртка React Hook Form для
                                    полей, которые не работают нативно с register (checkbox,
                                    кастомные компоненты, React Select и т.д.)
                                    
                                    render={({ field }) => ...} — field содержит:
                                      field.value   — текущее значение (true/false)
                                      field.onChange — функция для изменения значения
                                ─────────────────────────────────────────── */}
                                <div className="md:col-span-2 flex gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    {/* isSpicy checkbox */}
                                    <Controller
                                        name="isSpicy"
                                        control={control}
                                        render={({ field }) => (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="w-4 h-4 text-indigo-600 rounded"
                                                />
                                                <span className="text-sm font-medium text-gray-700">🌶️ Spicy</span>
                                            </label>
                                        )}
                                    />

                                    {/* isVegetarian checkbox */}
                                    <Controller
                                        name="isVegetarian"
                                        control={control}
                                        render={({ field }) => (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="w-4 h-4 text-indigo-600 rounded"
                                                />
                                                <span className="text-sm font-medium text-gray-700">🥗 Vegetarian</span>
                                            </label>
                                        )}
                                    />

                                    {/* isPopular checkbox */}
                                    <Controller
                                        name="isPopular"
                                        control={control}
                                        render={({ field }) => (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="w-4 h-4 text-indigo-600 rounded"
                                                />
                                                <span className="text-sm font-medium text-gray-700">⭐ Popular</span>
                                            </label>
                                        )}
                                    />
                                </div>

                                {/* ── Ингредиенты ──────────────────────────── */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ingredients (через запятую)
                                    </label>
                                    <input
                                        {...register("ingredients")}
                                        type="text"
                                        placeholder="Tomato, Cheese, Onion..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* ── URL изображения ──────────────────────── */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Image URL
                                    </label>
                                    <input
                                        {...register("productImg")}
                                        type="text"
                                        placeholder="https://example.com/image.jpg"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.productImg ? "border-red-400 bg-red-50" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.productImg && (
                                        <p className="mt-1 text-xs text-red-500">{errors.productImg.message}</p>
                                    )}
                                </div>

                                {/* ── Описание ─────────────────────────────── */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        {...register("productDescription")}
                                        rows="3"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.productDescription ? "border-red-400 bg-red-50" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.productDescription && (
                                        <p className="mt-1 text-xs text-red-500">{errors.productDescription.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* ── Кнопки подтверждения ──────────────────── */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                {/* 
                                    isSubmitting — true пока handleSubmit ожидает завершения onSubmit.
                                    Это автоматически блокирует кнопку и предотвращает двойную отправку.
                                    isLoadingAction — true пока идёт POST или PUT запрос.
                                */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isLoadingAction}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {isLoadingAction ? "Saving..." : "Save Product"}
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