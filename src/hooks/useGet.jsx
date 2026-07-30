import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const useGet = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refresh = () => {
        setRefreshIndex((prev) => prev + 1);
    };

    useEffect(() => {
        if (!url) return;
        const abortController = new AbortController();
        let isMount = true;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`${API_URL}/${url}`, {
                    signal: abortController.signal,
                });
                if (isMount) {
                    setData(res.data);
                }
            } catch (err) {
                const isAbort =
                    err?.name === "CanceledError" ||
                    err?.code === "ERR_CANCELED" ||
                    axios.isCancel?.(err);

                if (!isAbort) {
                    if (isMount) {
                        setError(err?.response?.data || err?.message || "Something went wrong");
                    }
                    console.error(err);
                }
            } finally {
                if (isMount) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMount = false;
            abortController.abort();
        };
    }, [url, refreshIndex]);

    return { data, loading, error, refresh };
};

export default useGet;