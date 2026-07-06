import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as external from "../api/external";
import * as movies from "../api/movies";

import { ExternalSearchPage } from "./ExternalSearchPage";

vi.mock("../api/external", () => ({
  externalSearch: vi.fn(),
  saveExternalMovie: vi.fn(),
}));
vi.mock("../api/movies", () => ({
  listMovies: vi.fn(),
}));
vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));
vi.mock("../components/ExternalHoverCardWrap", () => ({
  ExternalHoverCardWrap: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("ExternalSearchPage", () => {
  const externalSearchMock = vi.mocked(external.externalSearch);
  const saveExternalMovieMock = vi.mocked(external.saveExternalMovie);
  const listMoviesMock = vi.mocked(movies.listMovies);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows View local after hydration when searched item already exists locally", async () => {
    externalSearchMock.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 100,
          title: "Inception",
          overview: "A dream thriller",
          poster_path: "/inception.jpg",
          release_date: "2010-07-16",
        },
      ],
    });

    listMoviesMock.mockResolvedValue([
      {
        id: 42,
        title: "Inception",
        description: "",
        releaseDate: "2010-07-16",
        posterUrl: "",
        genreIds: [],
        reviewIds: [],
        watchListIds: [],
        duration: 148,
        director: "Nolan",
        budget: 160000000,
      },
    ]);

    render(
      <MemoryRouter>
        <ExternalSearchPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText("Search TMDB");
    await userEvent.type(input, "Inception");
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "View local" })).toHaveAttribute("href", "/media/42");
    });
  });

  it("switches from Import to View local immediately after successful import", async () => {
    externalSearchMock.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 200,
          title: "Interstellar",
          overview: "Space exploration",
          poster_path: "/interstellar.jpg",
          release_date: "2014-11-07",
        },
      ],
    });

    listMoviesMock.mockResolvedValue([]);
    saveExternalMovieMock.mockResolvedValue({ id: 77 } as any);

    render(
      <MemoryRouter>
        <ExternalSearchPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText("Search TMDB");
    await userEvent.type(input, "Interstellar");
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    const importButton = await screen.findByRole("button", { name: "Import" });
    await userEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "View local" })).toHaveAttribute("href", "/media/77");
    });
  });
});
