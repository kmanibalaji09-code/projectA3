import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Layout } from "../components/Layout";
import { ProductThumb } from "../components/ProductThumb";
import { products as initialProducts } from "../data/mockData";
import type { Product } from "../types";
import { listProductsApi } from "../services/apiClient";

export function ProductFeed() {
  const [category, setCategory] = useState("All Categories");
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    listProductsApi().then((items) => setProducts(items.map((item) => ({
      id: item.id, name: item.title, description: item.description, category: item.category,
      price: item.price, image: "product", features: [], status: item.status,
      createdAt: item.created_at, rating: item.rating, reviewCount: 0,
    })))).catch(() => undefined);
  }, []);

  const categories = ["All Categories", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered =
    category === "All Categories" ? products : products.filter((p) => p.category === category);

  return (
    <Layout title="Product Feed" subtitle="Browse products from our developers">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search products..."
          className="focus-ring w-full max-w-sm rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="focus-ring rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/feed/${p.id}`}
            className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
          >
            <ProductThumb image={p.image} className="h-36 w-full rounded-none" />
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <p className="text-sm font-semibold text-ink-900 group-hover:text-accent-700">{p.name}</p>
              <p className="line-clamp-2 text-xs text-ink-500">{p.description}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-base font-bold text-ink-900">${p.price.toFixed(2)}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-ink-600">
                  <Star size={13} className="fill-warning-600 text-warning-600" />
                  {p.rating.toFixed(1)}
                  <span className="text-ink-400">({p.reviewCount})</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
