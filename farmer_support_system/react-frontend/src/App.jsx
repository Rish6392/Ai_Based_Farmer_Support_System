import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { 
  LandingPage, 
  ChatbotPage, 
  DiseasePredictionPage, 
  DashboardPage, 
  ContactPage,
  FaqPage,
  NotFoundPage 
} from './pages';
import { ChatProvider, DocumentProvider } from './context';

function App() {
  return (
    <ChatProvider>
      <DocumentProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="chat" element={<ChatbotPage />} />
            <Route path="disease-prediction" element={<DiseasePredictionPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </DocumentProvider>
    </ChatProvider>
  );
}

export default App;
