import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import FavoritesPage from "../pages/favorites/FavoritesPage";
import CreatePostPage from "../pages/posts/CreatePostPage";
import HomePage from "../pages/posts/HomePage";
import MyPostsPage from "../pages/posts/MyPostsPage";
import PostDetailsPage from "../pages/posts/PostDetailsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:id" element={<PostDetailsPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}