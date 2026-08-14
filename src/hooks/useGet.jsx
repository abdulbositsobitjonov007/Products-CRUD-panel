// ============================================================
// useGet.jsx — Хук для GET-запросов (READ)
//
// ЗАЧЕМ: Получает данные с сервера при монтировании компонента.
// ИЗМЕНЕНИЕ: Теперь использует axiosInstance вместо сырого axios.
//   Это значит baseURL, timeout и interceptors работают автоматически.
// ============================================================

import api from "../api/axiosInstance"; // наш настроенный экземпляр
import { useEffect, useState } from "react";

const useGet = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // refreshIndex — счётчик для принудительного повторного запроса.
    // Вызов refresh() увеличивает его → useEffect перезапускается → данные обновляются.
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refresh = () => {
        // Увеличиваем счётчик, чтобы запустить useEffect заново
        setRefreshIndex((prev) => prev + 1);
    };

    useEffect(() => {
        if (!url) return; // не делаем запрос если url не передан

        // AbortController позволяет отменить запрос при размонтировании компонента.
        // Это предотвращает утечки памяти (memory leaks) и ошибки "Can't update state on unmounted component".
        const abortController = new AbortController();
        let isMount = true; // флаг: компонент ещё смонтирован?

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // GET-запрос через axiosInstance (baseURL подставляется автоматически)
                const res = await api.get(`/${url}`, {
                    signal: abortController.signal, // передаём сигнал для возможности отмены
                });
                if (isMount) {
                    setData(res.data); // сохраняем данные в состояние
                }
            } catch (err) {
                // Проверяем — это намеренная отмена запроса или реальная ошибка?
                const isAbort =
                    err?.name === "CanceledError" ||
                    err?.code === "ERR_CANCELED" ||
                    api.isCancel?.(err);

                if (!isAbort && isMount) {
                    // Реальная ошибка — сохраняем её текст для отображения в UI
                    setError(err?.response?.data || err?.message || "Something went wrong");
                    console.error("[useGet] Error:", err);
                }
            } finally {
                if (isMount) {
                    setLoading(false); // заканчиваем загрузку в любом случае
                }
            }
        };

        fetchData();

        // Функция очистки: вызывается когда компонент размонтируется
        // или когда зависимости (url, refreshIndex) изменились
        return () => {
            isMount = false;         // помечаем что компонент размонтирован
            abortController.abort(); // отменяем незавершённый запрос
        };
    }, [url, refreshIndex]); // перезапускаем при смене url или при вызове refresh()

    return { data, loading, error, refresh };
};

export default useGet;