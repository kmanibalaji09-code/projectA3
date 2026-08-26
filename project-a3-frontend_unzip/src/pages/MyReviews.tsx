import { Star } from "lucide-react";
import { Layout } from "../components/Layout";
import { Badge } from "../components/Badge";
import { reviews, getProductById } from "../data/mockData";
import { useApp } from "../context/AppContext";

export function MyReviews() {
  const { user } = useApp();
  const mine = reviews.filter((r) => r.customerName === user?.name || r.customerId === user?.id);
  const shown = mine.length > 0 ? mine : reviews.slice(0, 1);

  return (
    <Layout title="My Reviews" subtitle="Reviews you've submitted">
      <div className="card divide-y divide-ink-100">
        {shown.map((r) => {
          const product = getProductById(r.productId);
          return (
            <div key={r.id} className="flex flex-col gap-2 p-5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink-900">{product?.name}</p>
                {r.rating < 3 && <Badge tone="accent">Case in progress</Badge>}
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className={s <= r.rating ? "fill-warning-600 text-warning-600" : "text-ink-200"} />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-ink-600">{r.text}</p>
              <span className="text-xs text-ink-400">
                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
