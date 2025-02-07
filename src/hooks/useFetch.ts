import { useState, useEffect } from 'react';

interface Data {
    title: string,
    body: string,
    author: string,
    time: Date,
    id: number
}

const useFetch = (url: any) => {
    const [data, setData] = useState<null|Data[]|Data>(null);
    const [isPending, setIsPending] = useState<boolean>(true);
    const [error, setError] = useState<null|string>(null);

    useEffect(() => {
        const abortCont = new AbortController();

        setTimeout(() => {
            fetch(url, {signal: abortCont.signal})
            .then(res => {
                if(!res.ok) {
                    throw Error('Could not fetch the data for that resource');
                }
                return res.json()
            })
            .then(data => {
                setData(data);
                setIsPending(false);
                setError(null);
            })
            .catch(e => {
                if(e.name === 'AbortError') {
                    console.log('fetch aborted');
                }
                else {
                    setIsPending(false);
                    setError(e.message);
                }
            })
        }, 1000)

        return () => abortCont.abort();
    }, [url]);

    return { data, isPending, error };
}

export default useFetch;