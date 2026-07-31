import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { FiStar } from "react-icons/fi";

const Reviews = ({ productId }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/${productId}`);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: (newReview) => api.post("/reviews", newReview),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", productId]);
      setComment("");
      toast.success("Review posted!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ productId, rating, comment });
  };

  return (
    <div className="reviews-container">
      {user && (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-select">
            {[1, 2, 3, 4, 5].map((num) => (
              <FiStar 
                key={num} 
                className={num <= rating ? "star filled" : "star"} 
                onClick={() => setRating(num)}
              />
            ))}
          </div>
          <textarea 
            className="form-input" 
            placeholder="Write your review..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            Post Review
          </button>
        </form>
      )}

      <div className="reviews-list">
        {isLoading ? (
          <p>Loading reviews...</p>
        ) : reviews?.length === 0 ? (
          <p>No reviews yet. Be the first!</p>
        ) : (
          reviews?.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <strong>{review.user.name}</strong>
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={i < review.rating ? "star filled" : "star"} />
                  ))}
                </div>
              </div>
              <p>{review.comment}</p>
              <small>{new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .reviews-container { margin-top: 20px; }
        .review-form { margin-bottom: 40px; border-bottom: 1px solid var(--border); padding-bottom: 30px; }
        .rating-select { display: flex; gap: 5px; margin-bottom: 15px; font-size: 1.5rem; }
        .star { cursor: pointer; color: var(--text-muted); }
        .star.filled { color: var(--primary); fill: var(--primary); }
        .review-item { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .review-item p { color: var(--text-muted); }
        .review-item small { color: var(--text-muted); font-size: 0.8rem; }
      `}} />
    </div>
  );
};

export default Reviews;
