import React from "react";
import LoginForm from "./auth/LoginForm";
import TaskList from "./tasks/TaskList";
import { observer } from "mobx-react";
import { authStore } from "./stores/authStore";
import "./styles/index.css";
const App: React.FC = observer(() => {
  return <div>{authStore.isLoggedIn ? <TaskList /> : <LoginForm />}</div>;
});

export default App;
