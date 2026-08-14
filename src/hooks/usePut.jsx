// ============================================================
// usePut.jsx — Хук для PUT-запросов (UPDATE, полная замена)
//
// ЗАЧЕМ: Обновляет существующий ресурс на сервере полностью.
//   PUT отправляет ВЕСЬ объект — сервер заменяет запись целиком.
//   (В отличие от PATCH, который меняет только указанные поля)
//
// ИЗМЕНЕНИЕ: axiosInstance вместо сырого axios.
// ============================================================

import api from "../api/axiosInstance"; // настроенный экземпляр
import { useState } from "react";

const usePut = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // putData(body, id, customBaseUrl) — обновляет ресурс
    // id          — идентификатор записи (например, "42")
    // customBaseUrl — вложенный маршрут (например, "categories/3/products")
    const putData = async (body, id = "", customBaseUrl = url) => {
        setLoading(true);
        setError(null);

        const baseUrl = customBaseUrl || url;
        // Если id передан — строим URL /categories/3/products/42
        // Если нет — просто /categories/3/products
        const targetUrl = id ? `${baseUrl}/${id}` : baseUrl;

        try {
            // PUT-запрос: полностью заменяет запись на сервере
            const res = await api.put(`/${targetUrl}`, body);
            setData(res.data);
            return res.data;
        } catch (err) {
            const errorMsg = err?.response?.data || err?.message || "Something went wrong";
            setError(errorMsg);
            console.error("[usePut] Error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { putData, execute: putData, data, loading, error };
};

export default usePut;