// components/markets/MarketsFilters.tsx

import React from "react";
import type { Marketplace } from "@/lib/scarlette/markets";

export interface MarketsFiltersState {
  marketplace: Marketplace;
  keyword: string;
  minPrice: string;
  maxPrice: string;
}

interface MarketsFiltersProps {
  filters: MarketsFiltersState;
  isScanning: boolean;
  lastScanAt: string | null;
  error: string | null;
  onChange: (field: keyof MarketsFiltersState, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const MARKETPLACE_OPTIONS: { value: Marketplace; label: string }[] = [
  { value: "ebay_uk", label: "eBay UK" },
  { value: "amazon_uk", label: "Amazon UK" },
  { value: "etsy", label: "Etsy" },
];

export const MarketsFilters: React.FC<MarketsFiltersProps> = ({
  filters,
  isScanning,
  lastScanAt,
  error,
  onChange,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md shadow-black/30"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-slate-100">Scan controls</h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {lastScanAt && (
            <span className="rounded-full border border-slate-800 px-2 py-0.5">
              Last scan:{" "}
              <span className="font-mono">
                {new Date(lastScanAt).toLocaleTimeString()}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Marketplace */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="marketplace"
            className="text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Marketplace
          </label>
          <select
            id="marketplace"
            className="h-9 rounded-lg border border-slate-700 bg-slate-950/60 px-2 text-sm text-slate-100 outline-none ring-slate-500 transition focus:border-slate-500 focus:ring-1"
            value={filters.marketplace}
            onChange={(e) =>
              onChange("marketplace", e.target.value as Marketplace)
            }
          >
            {MARKETPLACE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Keyword */}
        <div className="flex flex-col gap-1.5 md:col-span-1">
          <label
            htmlFor="keyword"
            className="text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Keyword search
          </label>
          <input
            id="keyword"
            type="text"
            placeholder="e.g. 2000x25 HD monocular telescope"
            className="h-9 rounded-lg border border-slate-700 bg-slate-950/60 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-slate-500 transition focus:border-slate-500 focus:ring-1"
            value={filters.keyword}
            onChange={(e) => onChange("keyword", e.target.value)}
          />
        </div>

        {/* Min price */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="minPrice"
            className="text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Min price
          </label>
          <div className="flex items-center gap-1">
            <span className="rounded-md border border-slate-700 bg-slate-950/60 px-2 text-xs text-slate-400">
              £
            </span>
            <input
              id="minPrice"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className="h-9 flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-slate-500 transition focus:border-slate-500 focus:ring-1"
              value={filters.minPrice}
              onChange={(e) => onChange("minPrice", e.target.value)}
            />
          </div>
        </div>

        {/* Max price */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="maxPrice"
            className="text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Max price
          </label>
          <div className="flex items-center gap-1">
            <span className="rounded-md border border-slate-700 bg-slate-950/60 px-2 text-xs text-slate-400">
              £
            </span>
            <input
              id="maxPrice"
              type="number"
              min={0}
              step="0.01"
              placeholder="100.00"
              className="h-9 flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-slate-500 transition focus:border-slate-500 focus:ring-1"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Use keyword + price band to keep scans focused and fast.
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isScanning}
        >
          {isScanning ? "Scanning…" : "Scan markets"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs text-rose-400">
          {error}
        </p>
      )}
    </form>
  );
};
