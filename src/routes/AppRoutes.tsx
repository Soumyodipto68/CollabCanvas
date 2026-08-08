import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";



const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element= {<DashboardPage/>} />
    </Routes>
  );
};

export default AppRoutes;