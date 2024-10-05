import { useInfiniteQuery, UseInfiniteQueryOptions, InfiniteData } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

interface Props<Resource> {
  queryKey: string;
  url: string;
  options?: Partial<UseInfiniteQueryOptions<InfiniteData<Resource>, AxiosError<Error>>>;
}
const useFetchData = <Resource>({ queryKey, url, options }: Props<Resource>) => {
  const query = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: ({ pageParam }) => axios.get(`${apiUrl}${url}`, { params: { page: pageParam } }).then(response => response.data),
    initialPageParam: 0,
    getNextPageParam: (_, pages) => pages.length,
    ...options,
  });

  return query;
};

export default useFetchData;
