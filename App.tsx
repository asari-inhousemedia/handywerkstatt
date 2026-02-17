import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './components/AdminPage.tsx';
import DisplayPage from './components/DisplayPage.tsx';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* Standard = Admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Display (nur über Button oder Direktlink) */}
          <Route path="/display" element={<DisplayPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />

        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
