import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './utils/api.js';
import MainLayout from './components/Layout/MainLayout.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Plants from './pages/Plants/Plants.jsx';
import PlantForm from './pages/Plants/PlantForm.jsx';
import PlantDetail from './pages/Plants/PlantDetail.jsx';
import Diaries from './pages/Diaries/Diaries.jsx';
import DiaryForm from './pages/Diaries/DiaryForm.jsx';
import DiaryDetail from './pages/Diaries/DiaryDetail.jsx';
import Reminders from './pages/Reminders.jsx';
import Recognition from './pages/Recognition.jsx';
import Community from './pages/Community/Community.jsx';
import PostForm from './pages/Community/PostForm.jsx';
import PostDetail from './pages/Community/PostDetail.jsx';
import Wiki from './pages/Wiki/Wiki.jsx';
import WikiDetail from './pages/Wiki/WikiDetail.jsx';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="plants" element={<Plants />} />
          <Route path="plants/new" element={<PlantForm />} />
          <Route path="plants/:id" element={<PlantDetail />} />
          <Route path="plants/:id/edit" element={<PlantForm />} />
          <Route path="diaries" element={<Diaries />} />
          <Route path="diaries/new" element={<DiaryForm />} />
          <Route path="diaries/:id" element={<DiaryDetail />} />
          <Route path="diaries/:id/edit" element={<DiaryForm />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="recognition" element={<Recognition />} />
          <Route path="community" element={<Community />} />
          <Route path="community/new" element={<PostForm />} />
          <Route path="community/:id" element={<PostDetail />} />
          <Route path="wiki" element={<Wiki />} />
          <Route path="wiki/:id" element={<WikiDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
