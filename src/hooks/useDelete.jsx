import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const useDelete = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteData = async (id, customBaseUrl = url) => {
        setLoading(true);
        setError(null);
        const targetUrl = id ? `${customBaseUrl}/${id}` : customBaseUrl;
        const fullUrl = `${API_URL}/${targetUrl}`;
        console.log("DELETE →", fullUrl);
        try {
            const res = await axios.delete(fullUrl);
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

    return { deleteData, execute: deleteData, data, loading, error };
};

export default useDelete;