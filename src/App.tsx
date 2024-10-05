import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Searchbox from 'components/UserSearch/Searchbox';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Searchbox />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
