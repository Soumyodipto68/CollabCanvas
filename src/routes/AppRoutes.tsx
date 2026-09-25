import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { RecentPage } from "../pages/Recent/RecentPage";
import { PriorityPage } from "../pages/Priority/PriorityPage";
import { SharedPage } from "../pages/Shared/SharedPage";
import { SettingsPage } from "../pages/Settings/SettingsPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { ProtectedRoute } from "./ProtectedRoute";
import { BoardPage } from "../pages/Board/BoardPage";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/recent" element={<RecentPage />} />
            <Route path="/priority" element={<PriorityPage />} />
            <Route path="/shared" element={<SharedPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/board/:boardId" element={<BoardPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;