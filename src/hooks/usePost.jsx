// ============================================================
// usePost.jsx — Хук для POST-запросов (CREATE)
//
// ЗАЧЕМ: Отправляет новые данные на сервер.
// ИЗМЕНЕНИЕ: axiosInstance вместо сырого axios — baseURL, timeout
//   и interceptors (токен авторизации) добавляются автоматически.
// ============================================================

import api from "../api/axiosInstance"; // настроенный экземпляр
import { useState } from "react";

const usePost = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // postData(body, customUrl) — отправляет body на сервер
    // customUrl позволяет использовать вложенные маршруты:
    // например, "categories/3/products" вместо дефолтного "products"
    const postData = async (body, customUrl = url) => {
        setLoading(true);  // показываем состояние загрузки в UI
        setError(null);     // сбрасываем предыдущую ошибку

        try {
            // POST /customUrl — отправляем body как JSON в теле запроса
            // api автоматически добавляет baseURL и Content-Type: application/json
            const res = await api.post(`/${customUrl}`, body);
            setData(res.data); // сохраняем ответ сервера
            return res.data;   // возвращаем данные вызывающему коду
        } catch (err) {
            // Достаём читаемый текст ошибки из ответа сервера
            const errorMsg = err?.response?.data || err?.message || "Something went wrong";
            setError(errorMsg);
            console.error("[usePost] Error:", err);
            throw err; // пробрасываем ошибку вверх — чтобы try/catch в компоненте поймал её
        } finally {
            setLoading(false); // снимаем состояние загрузки в любом случае
        }
    };

    return { postData, execute: postData, data, loading, error };
};

export default usePost;