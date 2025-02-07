import { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '../lib/axios';
import useSWRMutation from 'swr/mutation'

async function fetcher(url: string, { arg }: { arg: any }) {
  return axiosInstance
    .post(url, arg)
    .then((res) => res.data)
    .catch((err) => {
      throw err.response?.data || err;
    });
}

export function usePost<T>(url: string, options: AxiosRequestConfig = {}) {
  const { trigger, data, error, isMutating } = useSWRMutation(url, fetcher);

  return { 
    trigger, 
    data, 
    error, 
    isLoading: isMutating 
  };
}
