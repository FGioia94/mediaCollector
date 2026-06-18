import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRolesPage } from "./pages/AdminRolesPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { ExternalMediaDetailsPage } from "./pages/ExternalMediaDetailsPage";
import { ExternalSearchPage } from "./pages/ExternalSearchPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { GenresPage } from "./pages/GenresPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MediaDetailsPage } from "./pages/MediaDetailsPage";
import { MovieFormPage } from "./pages/MovieFormPage";
import { MoviesPage } from "./pages/MoviesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { TrendingPage } from "./pages/TrendingPage";
import { TVShowFormPage } from "./pages/TVShowFormPage";
import { TVShowsPage } from "./pages/TVShowsPage";
import { WatchlistPage } from "./pages/WatchlistPage";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/media/:id" element={<MediaDetailsPage />} />

            <Route path="/movies" element={<MoviesPage />} />
            <Route
              path="/movies/new"
              element={
                <ProtectedRoute>
                  <MovieFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies/:id/edit"
              element={
                <ProtectedRoute>
                  <MovieFormPage />
                </ProtectedRoute>
              }
            />

            <Route path="/tvshows" element={<TVShowsPage />} />
            <Route
              path="/tvshows/new"
              element={
                <ProtectedRoute>
                  <TVShowFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tvshows/:id/edit"
              element={
                <ProtectedRoute>
                  <TVShowFormPage />
                </ProtectedRoute>
              }
            />

            <Route path="/genres" element={<GenresPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/external" element={<ExternalSearchPage />} />
            <Route path="/external/movie/:id" element={<ExternalMediaDetailsPage />} />

            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <WatchlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute>
                  <AdminRolesPage />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="*"
              element={<p className="status">Page not found.</p>}
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
