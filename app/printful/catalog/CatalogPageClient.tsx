"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_SCARLETTE_API_BASE_URL ?? "http://127.0.0.1:8000";

type CatalogProductSummary = {
  id: number;
  type: string | null;
  brand: string | null;
  model: string | null;
  name: string | null;
  image: string | null;
  variant_count: number | null;
  currency: string | null;
  is_discontinued: boolean;
};

type CatalogPage = {
  total: number;
  offset: number;
  limit: number;
  items: CatalogProductSummary[];
};

type SelectionRecord = {
  id: string;
  created_at: string;
  printful_product_id: number;
  printful_variant_id: number | null;
  marketplaces: string[];
  title_override: string | null;
  notes: string | null;
  target_price: number | null;
  currency: string | null;
};

type SelectionList = {
  items: SelectionRecord[];
};

type MarketplaceOption = "amazon" | "ebay" | "etsy";

const MARKETPLACE_OPTIONS: MarketplaceOption[] = ["amazon", "ebay", "etsy"];

type PendingSelection = {
  marketplaces: MarketplaceOption[];
  target_price: string;
  title_override: string;
};

export default function CatalogPageClient() {
  const [catalog, setCatalog] = useState<CatalogPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState<SelectionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [pendingByProduct, setPendingByProduct] = useState<
    Record<number, PendingSelection>
  >({});

  const [search, setSearch] = useState("");

  // ----- Load catalog + selection on mount -----

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [catalogRes, selectionRes] = await Promise.all([
          fetch(`${API_BASE}/os/printful/catalog?offset=0&limit=50`),
          fetch(`${API_BASE}/os/printful/selection`),
        ]);

        if (!catalogRes.ok) {
          throw new Error(
            `Catalog error: ${catalogRes.status} ${catalogRes.statusText}`,
          );
        }
        if (!selectionRes.ok) {
          throw new Error(
            `Selection error: ${selectionRes.status} ${selectionRes.statusText}`,
          );
        }

        const catalogJson: CatalogPage = await catalogRes.json();
        const selectionJson: SelectionList = await selectionRes.json();

        setCatalog(catalogJson);
        setSelection(selectionJson.items ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ----- Derived / filtered catalog -----

  const filteredItems = useMemo(() => {
    if (!catalog) return [];
    if (!search.trim()) return catalog.items;

    const q = search.toLowerCase();
    return catalog.items.filter((item) => {
      const parts = [
        item.brand,
        item.model,
        item.name,
        item.type,
        String(item.id),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return parts.includes(q);
    });
  }, [catalog, search]);

  // ----- Pending selection helpers -----

  const getPending = (productId: number): PendingSelection => {
    return (
      pendingByProduct[productId] ?? {
        marketplaces: [],
        target_price: "",
        title_override: "",
      }
    );
  };

  const updatePending = (productId: number, patch: Partial<PendingSelection>) => {
    setPendingByProduct((prev) => ({
      ...prev,
      [productId]: {
        ...getPending(productId),
        ...patch,
      },
    }));
  };

  const toggleMarketplace = (productId: number, marketplace: MarketplaceOption) => {
    const current = getPending(productId);
    const exists = current.marketplaces.includes(marketplace);
    const next = exists
      ? current.marketplaces.filter((m) => m !== marketplace)
      : [...current.marketplaces, marketplace];

    updatePending(productId, { marketplaces: next });
  };

  // ----- API actions -----

  const handleAddSelection = async (product: CatalogProductSummary) => {
    const pending = getPending(product.id);

    if (pending.marketplaces.length === 0) {
      setError("Please choose at least one marketplace");
      return;
    }

    const body = {
      printful_product_id: product.id,
      printful_variant_id: null,
      marketplaces: pending.marketplaces,
      title_override: pending.title_override || null,
      notes: null,
      target_price:
        pending.target_price.trim() === ""
          ? null
          : Number(pending.target_price),
      currency: product.currency ?? "GBP",
    };

    try {
      setError(null);
      const res = await fetch(`${API_BASE}/os/printful/selection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Add selection error: ${res.status} ${text}`);
      }

      const json: SelectionRecord = await res.json();

      setSelection((prev) => [json, ...prev]);
      // optionally clear pending
      setPendingByProduct((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to add selection");
    }
  };

  // ----- Render helpers -----

  const renderMarketplaceChips = (productId: number) => {
    const pending = getPending(productId);
    return (
      <div className="flex flex-wrap gap-1">
        {MARKETPLACE_OPTIONS.map((m) => {
          const active = pending.marketplaces.includes(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => toggleMarketplace(productId, m)}
              className={`rounded-full px-2 py-1 text-xs border ${
                active
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-slate-800 text-slate-100 border-slate-600"
              }`}
            >
              {m.toUpperCase()}
            </button>
          );
        })}
      </div>
    );
  };

  const renderCatalogTable = () => {
    if (!catalog) {
      return (
        <div className="text-sm text-slate-400">
          {loading ? "Loading catalog..." : "No catalog data"}
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="text-sm text-slate-400">
          No products match your search.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Variants</th>
              <th className="px-3 py-2 text-left">Marketplaces</th>
              <th className="px-3 py-2 text-left">Target price</th>
              <th className="px-3 py-2 text-left">Title override</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const pending = getPending(item.id);
              const labelParts = [
                item.brand,
                item.model,
                item.name,
                item.id ? `#${item.id}` : null,
              ].filter(Boolean);
              const label = labelParts.join(" · ");

              return (
                <tr
                  key={item.id}
                  className="border-t border-slate-800 hover:bg-slate-900/80"
                >
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={label}
                          className="h-12 w-12 rounded-lg object-cover bg-slate-800"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-slate-800" />
                      )}
                      <div>
                        <div className="font-medium text-slate-50">
                          {label || "Unnamed product"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.currency || "GBP"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-slate-300">
                    <div>{item.type}</div>
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-slate-300">
                    {item.variant_count ?? "-"}
                  </td>
                  <td className="px-3 py-2 align-top">
                    {renderMarketplaceChips(item.id)}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="number"
                      step="0.01"
                      value={pending.target_price}
                      onChange={(e) =>
                        updatePending(item.id, {
                          target_price: e.target.value,
                        })
                      }
                      placeholder="e.g. 19.99"
                      className="w-28 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      value={pending.title_override}
                      onChange={(e) =>
                        updatePending(item.id, {
                          title_override: e.target.value,
                        })
                      }
                      placeholder="Optional title"
                      className="w-full max-w-xs rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => handleAddSelection(item)}
                      className="rounded-lg bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-500"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSelectionList = () => {
    if (!selection.length) {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
          No selections yet. Use the left-hand catalog to add products.
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Selected products ({selection.length})
        </div>
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {selection.map((sel) => (
            <div
              key={sel.id}
              className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-xs"
            >
              <div className="flex justify-between gap-2">
                <div className="font-medium text-slate-50">
                  Product #{sel.printful_product_id}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(sel.created_at).toLocaleString()}
                </div>
              </div>
              <div className="mt-1 text-slate-300">
                Marketplaces:{" "}
                <span className="font-mono">
                  {sel.marketplaces.join(", ") || "-"}
                </span>
              </div>
              {sel.target_price != null && (
                <div className="text-slate-300">
                  Target: {sel.currency ?? "GBP"} {sel.target_price.toFixed(2)}
                </div>
              )}
              {sel.title_override && (
                <div className="text-slate-300">
                  Title: {sel.title_override}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 text-slate-50">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Printful Catalog → Marketplace</h1>
        <p className="text-sm text-slate-400">
          Browse the Printful catalog, choose marketplaces (Amazon, eBay, Etsy),
          set a target price/title, and add them to Scarlette&apos;s selection
          list for downstream listing pipelines.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand/model/type/id..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            {catalog && (
              <div className="text-xs text-slate-400 whitespace-nowrap">
                Showing {filteredItems.length} of {catalog.total}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {renderCatalogTable()}
        </div>

        <div className="w-full lg:w-80">{renderSelectionList()}</div>
      </div>
    </div>
  );
}
