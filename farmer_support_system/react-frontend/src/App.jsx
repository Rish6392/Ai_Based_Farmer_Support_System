import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components";
import {
  ChatPage,
  DiseasePredictionPage,
  DashboardPage,
  NotFoundPage,
} from "./pages";
import { ChatProvider, DocumentProvider } from "./context";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ChatPage />} />
        <Route path="disease-prediction" element={<DiseasePredictionPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
