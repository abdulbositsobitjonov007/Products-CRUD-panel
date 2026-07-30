import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const usePut = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const putData = async (body, id = "", customBaseUrl = url) => {
        setLoading(true);
        setError(null);
        const baseUrl = customBaseUrl || url;
        const targetUrl = id ? `${baseUrl}/${id}` : baseUrl;
        try {
            const res = await axios.put(`${API_URL}/${targetUrl}`, body);
            setData(res.data);
            return res.data;
        } catch (err) {
            const errorMsg = err?.response?.data || err?.message || "Something went wrong";
            setError(errorMsg);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { putData, execute: putData, data, loading, error };
};

export default usePut;