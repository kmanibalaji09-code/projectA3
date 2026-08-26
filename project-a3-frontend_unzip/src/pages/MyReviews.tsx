import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Layout } from "../components/Layout";
import { Badge } from "../components/Badge";
import { listProductsApi, listReviewsApi, type BackendProduct, type BackendReview } from "../services/apiClient";
import { useApp } from "../context/AppContext";

export function MyReviews() {
  const { user } = useApp();
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    Promise.all([listReviewsApi(), listProductsApi()]).then(([reviewItems, productItems]) => {
      setReviews(reviewItems.filter((item) => item.user_id === user?.id));
      setProducts(productItems);
    }).catch(() => undefined);
  }, [user?.id]);

  return (
    <Layout title="My Reviews" subtitle="Reviews you've submitted">
      <div className="card divide-y divide-ink-100">
        {reviews.map((r) => {
          const product = products.find((item) => item.id === r.product_id);
          return (
            <div key={r.id} className="flex flex-col gap-2 p-5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink-900">{product?.title ?? r.product_id}</p>
                {r.rating < 3 && <Badge tone="accent">Case in progress</Badge>}
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className={s <= r.rating ? "fill-warning-600 text-warning-600" : "text-ink-200"} />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-ink-600">{r.review_text}</p>
              <span className="text-xs text-ink-400">
                {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
