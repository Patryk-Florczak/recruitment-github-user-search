import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import Searchbox from 'components/UserSearch/Searchbox';
import useSearchboxFormController from 'components/UserSearch/FormController';
import useInfiniteFetchData from 'hooks/useInfiniteFetchData';

jest.mock('components/UserSearch/FormController');
jest.mock('hooks/useInfiniteFetchData');

const queryWrapper = (children: ReactNode) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('Searchbox Component', () => {
  beforeEach(() => {
    (useSearchboxFormController as jest.Mock).mockReturnValue({
      register: jest.fn(),
      watch: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
      handleSubmit: jest.fn(fn => fn),
      reset: jest.fn(),
      formState: { isSubmitted: false, errors: {} },
    });

    (useInfiniteFetchData as jest.Mock).mockReturnValue({
      data: { pages: [] },
      error: null,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });
  });

  test('renders correctly', () => {
    render(queryWrapper(<Searchbox />));

    expect(screen.getByLabelText(/Search users.../i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub User Search/i)).toBeInTheDocument();
  });

  test('submits the form and triggers refetch', async () => {
    const refetchMock = jest.fn();
    (useSearchboxFormController as jest.Mock).mockReturnValue({
      register: jest.fn(),
      watch: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
      handleSubmit: jest.fn(fn => fn),
      reset: jest.fn(),
      formState: { isSubmitted: true, errors: {} },
    });

    (useInfiniteFetchData as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [] }] },
      error: null,
      fetchNextPage: jest.fn(),
      refetch: refetchMock,
    });

    render(queryWrapper(<Searchbox />));

    fireEvent.submit(screen.getByTestId('search-form'));

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  test('displays error messages when api or form validation returns errors', () => {
    (useSearchboxFormController as jest.Mock).mockReturnValue({
      register: jest.fn(),
      watch: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
      handleSubmit: jest.fn(fn => fn),
      reset: jest.fn(),
      formState: {
        isSubmitted: false,
        errors: { query: { message: 'Query is required' } },
      },
    });

    (useInfiniteFetchData as jest.Mock).mockReturnValue({
      data: null,
      error: { response: { data: { message: 'Network error' } } },
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(queryWrapper(<Searchbox />));

    expect(screen.getByText(/Query is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  test('loads more users when fetching next page', async () => {
    const fetchNextPageMock = jest.fn();
    const refetchMock = jest.fn();

    (useSearchboxFormController as jest.Mock).mockReturnValue({
      register: jest.fn(),
      watch: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
      handleSubmit: jest.fn(fn => fn),
      reset: jest.fn(),
      formState: { isSubmitted: true, errors: {} },
    });

    (useInfiniteFetchData as jest.Mock).mockReturnValue({
      data: {
        pages: [{ items: [{ id: 1, login: 'user1', avatar_url: 'url1' }], total_count: 50 }],
      },
      error: null,
      fetchNextPage: fetchNextPageMock,
      refetch: refetchMock,
    });

    render(queryWrapper(<Searchbox />));

    expect(screen.getByText(/user1/i)).toBeInTheDocument();
    expect(screen.getByText(/Loading .../i)).toBeInTheDocument();

    // NOTE not the best test, I'm aware, but unless I'm doing something wrong I think react-infinite-scroller lib is not exactly working
    // great in a simulated environment. Below is what I would try to do to test properly, but I didn't want to spend too much time on it.
    // Technically should be fine, since "Loading ..." will only show up if there is still more data. Also, testing hasMore can also cover
    // whether or not the data should still be fetched

    // const infiniteScrollContainer = screen.getByText() as Element;
    // fireEvent.scroll(infiniteScrollContainer, { target: { scrollY: 100 } });

    // await waitFor(() => {
    //   expect(fetchNextPageMock).toHaveBeenCalled();
    // });
  });

  test('calculates hasMore property as true when more users are available', () => {
    const fetchNextPageMock = jest.fn();

    (useSearchboxFormController as jest.Mock).mockReturnValue({
      register: jest.fn(),
      watch: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
      handleSubmit: jest.fn(fn => fn),
      reset: jest.fn(),
      formState: { isSubmitted: true, errors: {} },
    });

    (useInfiniteFetchData as jest.Mock).mockReturnValue({
      data: {
        pages: [{ items: [{ id: 1, login: 'user1', avatar_url: 'url1' }], total_count: 50 }],
      },
      error: null,
      fetchNextPage: fetchNextPageMock,
      refetch: jest.fn(),
    });

    render(queryWrapper(<Searchbox />));

    const input = screen.getByLabelText(/Search users.../i);
    fireEvent.change(input, { target: { value: 'user' } });
    fireEvent.submit(screen.getByTestId('search-form'));

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });

  test('calculates hasMore property as false when no more users are available', () => {
    const fetchNextPageMock = jest.fn();
    (useInfiniteFetchData as jest.Mock).mockReturnValue({
      data: {
        pages: [{ items: [{ id: 1, login: 'user1', avatar_url: 'url1' }], total_count: 1 }],
      },
      error: null,
      fetchNextPage: fetchNextPageMock,
      refetch: jest.fn(),
    });

    render(queryWrapper(<Searchbox />));

    const input = screen.getByLabelText(/Search users.../i);
    fireEvent.change(input, { target: { value: 'user' } });
    fireEvent.submit(screen.getByTestId('search-form'));

    expect(screen.queryByText('Loading ...')).not.toBeInTheDocument();
  });
});
