import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  QueryCache,
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import Landing from "./routes/Landing";
import Login from "./routes/Login";
import Library from "./routes/Library";
import PromptNew from "./routes/PromptNew";
import PromptEdit from "./routes/PromptEdit";
import Explore from "./routes/Explore";
import PromptDetail from "./routes/PromptDetail";
import { RequireAuth } from "./components/RequireAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import { ApiError } from "./lib/api";

const messageOf = (err: unknown) =>
  err instanceof ApiError || err instanceof Error
    ? err.message
    : "Something went wrong";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  queryCache: new QueryCache({
    onError: (err, query) => {
      // Only toast on background refetches (the UI shows error state on first load)
      if (query.state.data !== undefined) {
        toast.error(messageOf(err));
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (err, _vars, _ctx, mutation) => {
      // Skip if the mutation set its own onError so callers don't double-toast.
      if (mutation.options.onError) return;
      toast.error(messageOf(err));
    },
  }),
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/p/:id" element={<PromptDetail />} />
            <Route
              path="/library"
              element={
                <RequireAuth>
                  <Library />
                </RequireAuth>
              }
            />
            <Route
              path="/library/new"
              element={
                <RequireAuth>
                  <PromptNew />
                </RequireAuth>
              }
            />
            <Route
              path="/library/:id/edit"
              element={
                <RequireAuth>
                  <PromptEdit />
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
