import { useEffect, useState } from "react";

import * as reviewsApi from "../api/reviews";
import { useAuth } from "../auth/AuthContext";
import { MediaHoverLink } from "../components/MediaHoverLink";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonTable,
  errorMessage,
} from "../components/StatusViews";
import type { ReviewResponse } from "../types";

export function ReviewsPage() {
  const { isAuthenticated, userId } = useAuth();
  const [items, setItems] = useState<ReviewResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(8);

  const load = () => {
    reviewsApi
      .listReviews()
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const handleSave = async (id: number) => {
    try {
      await reviewsApi.updateReview(id, { text: editText, rating: editRating });
      setEditingId(null);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review? (admin only)")) return;
    try {
      await reviewsApi.deleteReview(id);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  return (
    <section>
      <h1>Reviews</h1>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      {items === null && !error && <SkeletonTable rows={5} cols={3} />}
      {items && items.length === 0 && <EmptyMsg>No reviews yet.</EmptyMsg>}
      {items && items.length > 0 && (
        <ul className="reviews">
          {items.map((review) => (
            <li key={review.id}>
              {editingId === review.id ? (
                <div className="vstack">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                  />
                  <textarea
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => handleSave(review.id)}
                    >
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <strong>Rating {review.rating}/10</strong> · author#{
                    review.authorId
                  }{" "}
                  · <MediaHoverLink mediaId={review.mediaItemId}>media #{review.mediaItemId}</MediaHoverLink>
                  <p>{review.text}</p>
                  <small>{new Date(review.createdAt).toLocaleString()}</small>
                  {isAuthenticated && (
                    <div className="row-actions">
                      {userId === review.authorId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(review.id);
                            setEditText(review.text);
                            setEditRating(review.rating);
                          }}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
