/**
 * Obsidia - المفكرة الذكية الشخصية للباحث
 *
 * الفلسفة: "ليست عقلاً بل وعياً بالعقل"
 * - طبقة فوق معرفية تُراقب تفكير الباحث وتُسجّله
 * - 25 وظيفة شخصية
 * - تكامل محدود مع منصة إقرأ (6 نقاط فقط)
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Search from './pages/Search';
import Cognitive from './pages/Cognitive';
import Settings from './pages/Settings';

// Create Query Client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="notes" element={<Notes />} />
              <Route path="notes/new" element={<NoteEditor />} />
              <Route path="notes/:noteId" element={<NoteEditor />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:projectId" element={<ProjectDetail />} />
              <Route path="search" element={<Search />} />
              <Route path="cognitive" element={<Cognitive />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <Toaster
            position="bottom-left"
            toastOptions={{
              duration: 3000,
              style: {
                direction: 'rtl',
                fontFamily: 'Cairo, Tajawal, sans-serif',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
