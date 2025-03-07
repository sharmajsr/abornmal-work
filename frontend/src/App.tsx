import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import FileList from './components/FileList';
import FileUpload from './components/FileUpload';
import FileDetails from './components/FileDetails';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">File Hub</h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <FileList />
                    </div>
                    <div>
                      <FileUpload />
                    </div>
                  </div>
                } />
                <Route path="/files/:id" element={<FileDetails />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
