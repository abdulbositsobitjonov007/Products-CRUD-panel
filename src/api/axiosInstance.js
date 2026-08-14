// ============================================================
// axiosInstance.js — Настроенный экземпляр (Instance) Axios
//
// ЗАЧЕМ:
//   Вместо того чтобы в каждом хуке писать:
//     axios.get(`${import.meta.env.VITE_API_URL}/products`)
//   мы один раз настраиваем экземпляр с baseURL и используем:
//     api.get(`/products`)
//
// ГДЕ ИСПОЛЬЗУЕТСЯ:
//   Импортируется во все хуки: useGet, usePost, usePut, usePatch, useDelete
// ============================================================

import axios from "axios";
import Cookies from "js-cookie";

// Читаем базовый URL из переменной окружения (.env файл)
const BASE_URL = import.meta.env.VITE_API_URL;

// ─── 1. Создаём Instance (экземпляр) ──────────────────────
// axios.create() возвращает копию Axios с предустановленными настройками.
// Все запросы через этот объект автоматически получат baseURL и timeout.
const api = axios.create({
  baseURL: BASE_URL,             // все запросы начинаются с этого URL
  timeout: 10000,                 // максимум 10 секунд ожидания ответа
  headers: {
    "Content-Type": "application/json", // говорим серверу, что шлём JSON
  },
});

// ─── 2. Interceptor запроса (Request Interceptor) ─────────
// Выполняется АВТОМАТИЧЕСКИ перед каждым исходящим запросом.
// Идеальное место для добавления токена авторизации.
api.interceptors.request.use(
  (config) => {
    // ----------------------------------------------------
    // Шаг 5 из ТЗ: Настройка авторизации API запросов 
    // ДОСТАЕМ ТОКЕН ИЗ COOKIE ВМЕСТО LOCAL STORAGE:
    // ----------------------------------------------------
    const token = Cookies.get("token");

    if (token) {
      // КУДА ВСТАВЛЯЕМ: Если токен есть — добавляем его в заголовок Authorization
      // В итоге запрос уйдет с Header -> Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ОБЯЗАТЕЛЬНО возвращаем config, иначе запрос не уйдёт на сервер
    return config;
  },
  (error) => {
    // Если ошибка до отправки (например, сеть недоступна) — пробрасываем дальше
    return Promise.reject(error);
  }
);

// ─── 3. Interceptor ответа (Response Interceptor) ─────────
// Выполняется АВТОМАТИЧЕСКИ после получения каждого ответа от сервера.
// Централизованная обработка HTTP-ошибок — не нужно дублировать в каждом хуке.
api.interceptors.response.use(
  (response) => {
    // Всё хорошо (2xx статус) — просто пропускаем ответ как есть
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // 401 Unauthorized — токен истёк или неверен
      // Можно добавить редирект: window.location.href = "/login"
      console.warn("[API] 401 Unauthorized — необходима авторизация");
    }

    if (status === 403) {
      // 403 Forbidden — токен есть, но прав нет (например, не admin)
      console.warn("[API] 403 Forbidden — недостаточно прав");
    }

    if (status === 404) {
      // 404 Not Found — такого ресурса не существует
      console.warn("[API] 404 Not Found —", error.config?.url);
    }

    if (status === 500) {
      // 500 Internal Server Error — проблема на сервере
      console.error("[API] 500 Server Error — внутренняя ошибка сервера");
    }

    // Отклоняем промис — ошибка будет поймана в catch() в хуке
    return Promise.reject(error);
  }
);

// Экспортируем настроенный экземпляр
export default api;
