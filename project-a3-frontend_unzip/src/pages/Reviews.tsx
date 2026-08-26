import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Layout } from "../components/Layout";
import { Badge } from "../components/Badge";
import { listProductsApi, listReviewsApi, type BackendProduct, type BackendReview } from "../services/apiClient";

export function Reviews() {
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    Promise.all([listReviewsApi(), listProductsApi()]).then(([reviewItems, productItems]) => {
      setReviews(reviewItems);
      setProducts(productItems);
    }).catch(() => undefined);
  }, []);

  return (
    <Layout title="Reviews" subtitle="All customer reviews across your products">
      <div className="card divide-y divide-ink-100">
        {reviews.map((r) => {
          const product = products.find((item) => item.id === r.product_id);
          return (
            <div key={r.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">Customer {r.user_id}</p>
                  <span className="text-xs text-ink-400">on {product?.title ?? r.product_id}</span>
                  {r.rating < 3 && <Badge tone="critical">Case Opened</Badge>}
                </div>
                <div className="mb-1.5 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className={s <= r.rating ? "fill-warning-600 text-warning-600" : "text-ink-200"} />
                  ))}
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-ink-600">{r.review_text}</p>
              </div>
              <span className="whitespace-nowrap text-xs text-ink-400">
                {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
