import React from "react";
import LoginForm from "./auth/LoginForm";
import TaskList from "./tasks/TaskList";
import { observer } from "mobx-react";
import { authStore } from "./stores/authStore";
import "./styles/index.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProfilePage from './components/ProfilePage';
import AllUsersPage from './components/AllUsersPage';
import DetailPage from './components/DetailPage';
import taskStore from './stores/taskStore';

// init only once
taskStore.init();

const App: React.FC = observer(() => {
  if (!authStore.isLoggedIn) return <LoginForm />;
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users" element={<AllUsersPage />} />
          <Route path="/tasks/detail/:id" element={<DetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
});

export default App;
