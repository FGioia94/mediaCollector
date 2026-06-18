import { Link } from "react-router-dom";

import type { MediaItemResponse } from "../types";

interface Props {
  media: MediaItemResponse;
}

export function MediaCard({ media }: Props) {
  const year = media.releaseDate ? media.releaseDate.slice(0, 4) : null;

  return (
    <Link to={`/media/${media.id}`} className="media-card">
      {media.posterUrl ? (
        <img
          src={media.posterUrl}
          alt={media.title}
          className="media-card-poster"
          loading="lazy"
        />
      ) : (
        <div className="media-card-poster placeholder">No image</div>
      )}
      <div className="media-card-body">
        <h3>{media.title}</h3>
        <div className="media-card-meta">
          {year && <span>{year}</span>}
          <span>{media.reviewIds.length} reviews</span>
          <span>{media.genreIds.length} genres</span>
        </div>
        <p>{media.description || "No description available."}</p>
      </div>
    </Link>
  );
}
