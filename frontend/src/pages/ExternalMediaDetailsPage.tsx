import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import * as external from "../api/external";
import { useAuth } from "../auth/AuthContext";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonDetails,
  errorMessage,
} from "../components/StatusViews";
import type { EnrichedMediaDetails } from "../types";

function normalizePosterUrl(posterUrl?: string): string | undefined {
  if (!posterUrl) return undefined;
  if (posterUrl.startsWith("http://") || posterUrl.startsWith("https://")) {
    return posterUrl;
  }
  return `https://image.tmdb.org/t/p/w500${posterUrl}`;
}

export function ExternalMediaDetailsPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);

  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<EnrichedMediaDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError("Invalid external movie id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    external
      .externalMovie(id)
      .then(setData)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setActionMsg(null);
    try {
      const saved = await external.saveExternalMovie(id);
      setActionMsg(`Saved as local movie #${saved.id}`);
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  if (loading) return <SkeletonDetails />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;
  if (!data) return <EmptyMsg>Movie details are unavailable.</EmptyMsg>;

  const posterUrl = normalizePosterUrl(data.posterUrl);

  return (
    <section className="details">
      <header className="details-header">
        {posterUrl && <img src={posterUrl} alt={data.title} className="poster" />}
        <div>
          <h1>{data.title}</h1>
          <p>{data.overview}</p>
          <ul className="meta">
            <li>IMDb rating: {data.imdbRating ?? "N/A"}</li>
            <li>Metascore: {data.metascore ?? "N/A"}</li>
          </ul>
          {isAuthenticated && (
            <div className="actions">
              <button type="button" onClick={handleSave}>
                Save to library
              </button>
            </div>
          )}
          {actionMsg && <p className="status">{actionMsg}</p>}
        </div>
      </header>
    </section>
  );
}
