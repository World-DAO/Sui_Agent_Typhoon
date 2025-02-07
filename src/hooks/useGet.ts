import useSWR from 'swr';
import { axiosInstance } from '../lib/axios';

export function useGet<T>(url: string, options = {}) {
  const fetcher = (url: string) =>
    axiosInstance
      .get<T>(url, options)
      .then((res) => res.data)
      .catch((err) => {
        throw err.response?.data || err;
      });

  const { data, error, isValidating, mutate } = useSWR<T>(url, fetcher);

  return { data, error, isValidating, mutate };
}
