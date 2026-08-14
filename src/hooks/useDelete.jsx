// ============================================================
// useDelete.jsx — Хук для DELETE-запросов (DELETE)
//
// ЗАЧЕМ: Удаляет ресурс с сервера по его id.
// ИЗМЕНЕНИЕ: axiosInstance вместо сырого axios.
//   Теперь baseURL, timeout и interceptors работают автоматически.
// ============================================================

import api from "../api/axiosInstance"; // настроенный экземпляр
import { useState } from "react";

const useDelete = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // deleteData(id, customBaseUrl) — удаляет ресурс
    // id           — идентификатор удаляемой записи
    // customBaseUrl — вложенный маршрут (например, "categories/3/products")
    const deleteData = async (id, customBaseUrl = url) => {
        setLoading(true);
        setError(null);

        // Строим полный путь: categories/3/products/42
        const targetUrl = id ? `${customBaseUrl}/${id}` : customBaseUrl;
        const fullPath = `/${targetUrl}`;

        // Логируем URL удаления для отладки в консоли
        console.log("[useDelete] DELETE →", fullPath);

        try {
            // DELETE-запрос: сервер удаляет запись с указанным id
            const res = await api.delete(fullPath);
            setData(res.data);
            return res.data;
        } catch (err) {
            const errorMsg = err?.response?.data || err?.message || "Something went wrong";
            setError(errorMsg);
            console.error("[useDelete] Error:", err);
            throw err;
        } finally {
            setLoading(false); // снимаем загрузку в любом случае
        }
    };

    return { deleteData, execute: deleteData, data, loading, error };
};

export default useDelete;