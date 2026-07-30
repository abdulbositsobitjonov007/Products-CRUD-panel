import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const usePatch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const patchData = async (body) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.patch(`${API_URL}/${url}`, body);
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

    return { patchData, execute: patchData, data, loading, error };
};

export default usePatch;