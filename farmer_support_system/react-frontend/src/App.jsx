import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { ChatPage, DiseasePredictionPage, DashboardPage, NotFoundPage } from './pages';
import { ChatProvider, DocumentProvider } from './context';

function App() {
  return (
    <ChatProvider>
      <DocumentProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ChatPage />} />
            <Route path="disease-prediction" element={<DiseasePredictionPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </DocumentProvider>
    </ChatProvider>
  );
}

export default App;
