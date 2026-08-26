import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, X } from "lucide-react";
import { Layout } from "../components/Layout";
import { ProductThumb } from "../components/ProductThumb";
import { getProductById, getReviewsForProduct } from "../data/mockData";
import { aiService } from "../services/aiService";

const ratingBreakdown = [
  { stars: 5, pct: 72 },
  { stars: 4, pct: 12 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 5 },
  { stars: 1, pct: 5 },
];

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? getProductById(id) : undefined;
  const reviews = id ? getReviewsForProduct(id) : [];

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!product) {
    return (
      <Layout title="Product not found">
        <p className="text-sm text-ink-500">This product doesn't exist in the demo dataset.</p>
      </Layout>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0 || !text.trim()) return;
    setSubmitting(true);
    // Mirrors the real flow: save review, then call the review-processing
    // service. Ratings below 3 create a customer case via the Sentinel agent.
    await aiService.analyzeReview(text, rating, product.id);
    setSubmitting(false);
    setSubmitted(true);
    if (rating < 3) {
      setTimeout(() => navigate("/cases/case-1024"), 900);
    }
  };

  return (
    <Layout title="Product Detail">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <ProductThumb image={product.image} className="mb-4 h-48 w-full" />
          <h2 className="text-lg font-bold text-ink-900">{product.name}</h2>
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            <Star size={15} className="fill-warning-600 text-warning-600" />
            <span className="font-semibold text-ink-900">{product.rating.toFixed(1)}</span>
            <span className="text-ink-400">({product.reviewCount} reviews)</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-ink-900">${product.price.toFixed(2)}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">{product.description}</p>

          <p className="mb-2 mt-5 text-sm font-semibold text-ink-900">Features</p>
          <ul className="space-y-1.5">
            {product.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink-600">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="focus-ring flex-1 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white hover:bg-accent-700"
            >
              Write a Review
            </button>
          </div>
          <button className="focus-ring mt-2 w-full rounded-lg border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
            Add to Cart
          </button>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-ink-900">Customer Reviews</h3>
          </div>

          <div className="mb-6 space-y-1.5">
            {ratingBreakdown.map((r) => (
              <div key={r.stars} className="flex items-center gap-3 text-xs text-ink-500">
                <span className="w-8">{r.stars}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-warning-500" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-8 text-right">{r.pct}%</span>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="mb-6 rounded-lg border border-accent-200 bg-accent-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-ink-900">Write a Review</p>
                <button onClick={() => setShowForm(false)} className="text-ink-400 hover:text-ink-700">
                  <X size={16} />
                </button>
              </div>

              {submitted ? (
                <p className="text-sm font-medium text-success-700">
                  Thanks for your feedback! {rating < 3 ? "We've created a case to look into this — redirecting..." : ""}
                </p>
              ) : (
                <>
                  <div className="mb-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setRating(s)} aria-label={`${s} stars`}>
                        <Star
                          size={22}
                          className={s <= rating ? "fill-warning-500 text-warning-500" : "text-ink-300"}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder="Tell us about your experience..."
                    className="focus-ring w-full rounded-lg border border-ink-200 bg-white p-3 text-sm placeholder:text-ink-400"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0 || !text.trim()}
                    className="focus-ring mt-3 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50"
                  >
                    {submitting ? "Analyzing..." : "Submit Review"}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="space-y-5">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-ink-100 pb-5 last:border-0">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">{r.customerName}</p>
                  <span className="text-xs text-ink-400">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="mb-2 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      className={s <= r.rating ? "fill-warning-600 text-warning-600" : "text-ink-200"}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-ink-600">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
