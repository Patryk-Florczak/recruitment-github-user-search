import { useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Box, TextField, debounce } from '@mui/material';
import { styled } from '@mui/system';

import { queryClient } from 'App';
import { SearchUsers } from 'types/api/SearchUsers';
import useInfiniteFetchData from 'hooks/useInfiniteFetchData';
import useSearchboxFormController from 'components/UserSearch/FormController';
import UserRow from 'components/UserSearch/elements/UserRow';
import { ErrorMessage } from 'components/utils/ErrorMessage';

const DEBOUNCE_TIME = 2000;

// NOTE I'm not sure what you can consider as "interesting" technique of functional programming, so I will mark a few concepts that can be treated as useful

const Searchbox = () => {
  // Custom hooks - I'm using custom hooks to potentially allow the usage in other components, reduce repeatability of the code and improve visibility to allow clear understanding
  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitted, errors: formErrors },
  } = useSearchboxFormController();

  const query = watch('query');

  const {
    data,
    error: responseError,
    fetchNextPage,
    refetch,
  } = useInfiniteFetchData<SearchUsers>({
    queryKey: 'users',
    url: `/search/users?q=${query}`,
    options: { enabled: !!isSubmitted },
  });

  // Memoization - to calculate whether more data should be fetched, I'm memoizing variables since they can potentially operate on large datasets
  const userList = useMemo(() => data?.pages.flatMap(data => data.items), [data]);

  const totalCount = useMemo(
    () => data?.pages[0]?.total_count,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, data],
  );

  const hasMore = useMemo(() => userList && !!totalCount && userList.length < totalCount, [totalCount, userList]);

  // Asynchronous logic in side effects - I'm adding a subscription to watch for form changes and call submit, while limiting the execution
  // so that refetch doesn't happen on every user input but instead after a delay.
  useEffect(() => {
    const subscription = watch(
      debounce(
        () =>
          handleSubmit(() => {
            queryClient.resetQueries({ queryKey: ['users'] });
            return refetch();
          })(),
        DEBOUNCE_TIME,
      ),
    );

    return () => subscription.unsubscribe();
  }, [handleSubmit, watch, refetch, reset]);

  return (
    <form onSubmit={handleSubmit(() => refetch())} autoComplete="off" data-testid="search-form">
      <Container>
        <Header>GitHub User Search</Header>
        <Box sx={{ width: '50%' }}>
          <TextField
            {...register('query')}
            label="Search users..."
            error={!!formErrors.query || !!responseError}
            variant="outlined"
            sx={{ width: '100%' }}
          />

          {formErrors.query && <ErrorMessage>{formErrors.query?.message}</ErrorMessage>}
          {!!responseError?.response?.data && <ErrorMessage>{responseError.response.data.message}</ErrorMessage>}
        </Box>
        <Card>
          <InfiniteScroll
            pageStart={0}
            loadMore={() => fetchNextPage()}
            initialLoad={false}
            useWindow={false}
            hasMore={isSubmitted && hasMore}
            loader={<div key={0}>Loading ...</div>}
          >
            {data
              ? data.pages.map(page => page.items.map(user => <UserRow avatarUrl={user.avatar_url} login={user.login} key={user.id} />))
              : 'No users'}
          </InfiniteScroll>
        </Card>
      </Container>
    </form>
  );
};

export default Searchbox;

const Header = styled('div')({
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'white',
});

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
});

const Card = styled('div')({
  width: '50%',
  height: '300px',
  overflow: 'auto',
  padding: '20px',
  backgroundColor: 'transparent',
  border: '1px solid #525252',
  borderRadius: '10px',
  color: 'white',
  boxSizing: 'border-box',
});
