import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminPostsPage from "../pages/admin/AdminPostsPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import ReceivedContactRequestsPage from "../pages/contactRequests/ReceivedContactRequestsPage";
import SentContactRequestsPage from "../pages/contactRequests/SentContactRequestsPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import FavoritesPage from "../pages/favorites/FavoritesPage";
import CreatePostPage from "../pages/posts/CreatePostPage";
import EditPostPage from "../pages/posts/EditPostPage";
import HomePage from "../pages/posts/HomePage";
import MyPostsPage from "../pages/posts/MyPostsPage";
import PostDetailsPage from "../pages/posts/PostDetailsPage";
import MyReportsPage from "../pages/reports/MyReportsPage";

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
            <Route path="/posts/:id/edit" element={<EditPostPage />} />
            <Route
              path="/contact-requests/sent"
              element={<SentContactRequestsPage />}
            />
            <Route
              path="/contact-requests/received"
              element={<ReceivedContactRequestsPage />}
            />
            <Route path="/my-reports" element={<MyReportsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/posts" element={<AdminPostsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}