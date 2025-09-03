import React from 'react';
import { Tabs } from './components';
import { ChatPage, DiseasePredictionPage, DashboardPage } from './pages';
import { ChatProvider, DocumentProvider } from './context';

function App() {
  return (
    <ChatProvider>
      <DocumentProvider>
        <div className="min-h-screen bg-gray-900 text-white">
          {/* Header matching Streamlit */}
          <div className="bg-gray-900 px-6 py-6">
            <div className="flex items-center mb-2">
              <div className="text-3xl mr-3">🌾</div>
              <h1 className="text-4xl font-bold text-white">
                Digital Krishi Officer - കൃഷി സഹായി
              </h1>
            </div>
            <p className="text-gray-300 text-base ml-12">
              AI-powered farming assistant for Kerala farmers
            </p>
          </div>
          
          <main className="px-0">
            <div className="h-[calc(100vh-140px)]">
              <Tabs defaultTab={0}>
                <Tabs.Panel label="💬 Ask Expert">
                  <ChatPage />
                </Tabs.Panel>
                <Tabs.Panel label="🌿 Crop Disease Detection">
                  <DiseasePredictionPage />
                </Tabs.Panel>
                <Tabs.Panel label="📊 Dashboard">
                  <DashboardPage />
                </Tabs.Panel>
              </Tabs>
            </div>
          </main>
        </div>
      </DocumentProvider>
    </ChatProvider>
  );
}

export default App;
