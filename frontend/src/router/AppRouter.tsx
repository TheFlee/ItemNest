import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminPostsPage from "../pages/admin/AdminPostsPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AccountPage from "../pages/account/AccountPage";
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
import ChatsPage from "../pages/chat/ChatsPage";
import ChatPage from "../pages/chat/ChatPage";
import LocaleLayout from "./LocaleLayout";
import i18n from "../i18n";

function RootRedirect() {
  const lang = i18n.resolvedLanguage === "az" ? "az" : "en";
  return <Navigate to={`/${lang}`} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/:lang" element={<LocaleLayout />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="posts/:slug" element={<PostDetailsPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="my-posts" element={<MyPostsPage />} />
              <Route path="create-post" element={<CreatePostPage />} />
              <Route path="posts/:slug/edit" element={<EditPostPage />} />
              <Route path="contact-requests/sent" element={<SentContactRequestsPage />} />
              <Route path="contact-requests/received" element={<ReceivedContactRequestsPage />} />
              <Route path="my-reports" element={<MyReportsPage />} />
              <Route path="chats" element={<ChatsPage />} />
              <Route path="chats/:chatId" element={<ChatPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route element={<MainLayout />}>
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/reports" element={<AdminReportsPage />} />
              <Route path="admin/posts" element={<AdminPostsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/categories" element={<AdminCategoriesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
