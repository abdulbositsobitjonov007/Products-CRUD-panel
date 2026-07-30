import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const usePost = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Хранит текст ошибки, если что-то сломалось

    const postData = async (body, customUrl = url) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/${customUrl}`, body);
            setData(res.data);
            return res.data;
        } catch (err) { 
            const errorMsg = err?.response?.data || err?.message || "Something went wrong"; // Достаем понятный текст ошибки от сервера, или дефолтную фразу
            setError(errorMsg);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { postData, execute: postData, data, loading, error };
};

export default usePost;