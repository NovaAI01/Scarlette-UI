// components/markets/MarketsResultsTable.tsx

import React from "react";
import type { MarketResultItem } from "@/lib/scarlette/markets";

interface MarketsResultsTableProps {
  results: MarketResultItem[];
  onSendToPricing: (item: MarketResultItem) => void;
}

export const MarketsResultsTable: React.FC<MarketsResultsTableProps> = ({
  results,
  onSendToPricing,
}) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-black/30">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-slate-100">Results</h2>
        <span className="text-xs text-slate-500">
          Thumbnails, prices, shipping, and quick links to listings.
        </span>
      </div>

      {results.length === 0 ? (
        <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-700 bg-slate-950/40 px-3 py-6 text-xs text-slate-500">
          <div>
            <p className="font-medium text-slate-300">No results to display.</p>
            <p className="mt-1">
              Run a scan with a keyword and price range to populate this table
              from the /os/markets/scan backend route.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Shipping</th>
                <th className="px-3 py-2 font-medium">Marketplace</th>
                <th className="px-3 py-2 font-medium">Link</th>
                <th className="px-3 py-2 font-medium text-right">Pricing OS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {results.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-slate-800 bg-slate-950/80">
                        {item.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="line-clamp-2 text-xs font-medium text-slate-100">
                          {item.title}
                        </span>
                        <span className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                          {item.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="font-mono text-sm text-emerald-300">
                      {item.currency} {item.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {item.shipping_cost != null ? (
                      <span className="font-mono text-[11px] text-slate-200">
                        {item.currency} {item.shipping_cost.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">n/a</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="rounded-full border border-slate-700 bg-slate-950/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                      {item.marketplace === "ebay_uk" && "eBay UK"}
                      {item.marketplace === "amazon_uk" && "Amazon UK"}
                      {item.marketplace === "etsy" && "Etsy"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-sky-400 underline-offset-2 hover:underline"
                    >
                      View listing
                    </a>
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md border border-emerald-500/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 transition hover:bg-emerald-500/20"
                      onClick={() => onSendToPricing(item)}
                    >
                      Send to Pricing OS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
