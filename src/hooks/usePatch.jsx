// ============================================================
// usePatch.jsx — Хук для PATCH-запросов (частичное обновление)
//
// ЗАЧЕМ: Обновляет только указанные поля ресурса на сервере.
//   PATCH отправляет только изменённые поля (например, только price),
//   а остальные данные остаются нетронутыми.
//   (В отличие от PUT, который заменяет запись целиком)
//
// ИЗМЕНЕНИЕ: axiosInstance вместо сырого axios.
// ============================================================

import api from "../api/axiosInstance"; // настроенный экземпляр
import { useState } from "react";

const usePatch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // patchData(body, id) — частично обновляет ресурс
    // body — объект только с изменёнными полями: { price: 150 }
    // id   — идентификатор записи для пути /url/:id
    const patchData = async (body, id = "") => {
        setLoading(true);
        setError(null);

        // Строим URL: /products/42 если id передан, иначе /products
        const targetUrl = id ? `/${url}/${id}` : `/${url}`;

        try {
            // PATCH-запрос: частичное обновление — только переданные поля
            const res = await api.patch(targetUrl, body);
            setData(res.data);
            return res.data;
        } catch (err) {
            const errorMsg = err?.response?.data || err?.message || "Something went wrong";
            setError(errorMsg);
            console.error("[usePatch] Error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { patchData, execute: patchData, data, loading, error };
};

export default usePatch;