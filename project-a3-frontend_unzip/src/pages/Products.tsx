import { useState } from "react";
import { Plus, Star, Pencil, Eye, EyeOff } from "lucide-react";
import { Layout } from "../components/Layout";
import { ProductThumb } from "../components/ProductThumb";
import { Badge } from "../components/Badge";
import { products as initialProducts } from "../data/mockData";
import type { Product } from "../types";
import { createProductApi, publishProductApi, updateProductApi } from "../services/apiClient";

export function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const toggleStatus = async (product: Product) => {
    try {
      const result = await publishProductApi(product.id, product.status !== "PUBLISHED");
      setProducts((prev) => prev.map((item) => item.id === product.id ? { ...item, status: result.status } : item));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update product status.");
    }
  };

  const addProduct = async () => {
    const title = window.prompt("Product name");
    if (!title?.trim()) return;
    const price = Number(window.prompt("Price", "0"));
    if (!Number.isFinite(price)) return;
    try {
      const result = await createProductApi({ title, description: "", price, category: "General" });
      setProducts((prev) => [...prev, {
        id: result.id, name: result.title, description: result.description,
        category: result.category, price: result.price, image: "product", features: [],
        status: result.status, createdAt: result.created_at, rating: result.rating, reviewCount: 0,
      }]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to create product.");
    }
  };

  const editProduct = async (product: Product) => {
    const title = window.prompt("Product name", product.name);
    if (!title?.trim()) return;
    try {
      const result = await updateProductApi(product.id, { title });
      setProducts((prev) => prev.map((item) => item.id === product.id ? { ...item, name: result.title } : item));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update product.");
    }
  };

  return (
    <Layout title="Products" subtitle="Manage your product catalog">
      <div className="mb-4 flex items-center justify-end">
        <button onClick={addProduct} className="focus-ring flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-700">
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Rating</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <ProductThumb image={p.image} className="h-10 w-10 rounded-md" />
                    <div>
                      <p className="font-semibold text-ink-900">{p.name}</p>
                      <p className="text-xs text-ink-500">{p.reviewCount} reviews</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink-700">{p.category}</td>
                <td className="px-5 py-3 font-medium text-ink-900">${p.price.toFixed(2)}</td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1 text-ink-700">
                    <Star size={14} className="fill-warning-600 text-warning-600" />
                    {p.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={p.status === "PUBLISHED" ? "success" : "neutral"}>
                    {p.status === "PUBLISHED" ? "Published" : "Unpublished"}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => editProduct(p)}
                      className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                      aria-label="Edit product"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => toggleStatus(p)}
                      className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                      aria-label="Toggle publish status"
                    >
                      {p.status === "PUBLISHED" ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
