import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Loading } from "./components/StatusViews";

import "./App.css";

const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage").then((module) => ({ default: module.DiscoverPage })));
const MediaDetailsPage = lazy(() => import("./pages/MediaDetailsPage").then((module) => ({ default: module.MediaDetailsPage })));
const MoviesPage = lazy(() => import("./pages/MoviesPage").then((module) => ({ default: module.MoviesPage })));
const MovieFormPage = lazy(() => import("./pages/MovieFormPage").then((module) => ({ default: module.MovieFormPage })));
const TVShowsPage = lazy(() => import("./pages/TVShowsPage").then((module) => ({ default: module.TVShowsPage })));
const TVShowFormPage = lazy(() => import("./pages/TVShowFormPage").then((module) => ({ default: module.TVShowFormPage })));
const GenresPage = lazy(() => import("./pages/GenresPage").then((module) => ({ default: module.GenresPage })));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage").then((module) => ({ default: module.ReviewsPage })));
const TrendingPage = lazy(() => import("./pages/TrendingPage").then((module) => ({ default: module.TrendingPage })));
const ExternalSearchPage = lazy(() => import("./pages/ExternalSearchPage").then((module) => ({ default: module.ExternalSearchPage })));
const ExternalMediaDetailsPage = lazy(() => import("./pages/ExternalMediaDetailsPage").then((module) => ({ default: module.ExternalMediaDetailsPage })));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage").then((module) => ({ default: module.WatchlistPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then((module) => ({ default: module.ResetPasswordPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((module) => ({ default: module.RegisterPage })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="app-main">
          <Suspense fallback={<Loading label="Loading page..." />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/media/:id" element={<MediaDetailsPage />} />

              <Route path="/movies" element={<MoviesPage />} />
              <Route
                path="/movies/new"
                element={
                  <ProtectedRoute requireEditor>
                    <MovieFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/movies/:id/edit"
                element={
                  <ProtectedRoute requireEditor>
                    <MovieFormPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/tvshows" element={<TVShowsPage />} />
              <Route
                path="/tvshows/new"
                element={
                  <ProtectedRoute requireEditor>
                    <TVShowFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tvshows/:id/edit"
                element={
                  <ProtectedRoute requireEditor>
                    <TVShowFormPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/genres"
                element={
                  <ProtectedRoute requireAdmin>
                    <GenresPage />
                  </ProtectedRoute>
                }
              />
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
                  <ProtectedRoute requireAdmin>
                    <AdminUsersPage />
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
          </Suspense>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
