// components/markets/MarketsResultsSummary.tsx

import React, { useMemo } from "react";
import type { MarketResultItem } from "@/lib/scarlette/markets";

interface MarketsResultsSummaryProps {
  results: MarketResultItem[];
  lastScanAt: string | null;
}

export const MarketsResultsSummary: React.FC<MarketsResultsSummaryProps> = ({
  results,
  lastScanAt,
}) => {
  const stats = useMemo(() => {
    if (!results.length) {
      return null;
    }

    const prices = results.map((r) => r.price).filter((p) => Number.isFinite(p));
    if (!prices.length) {
      return {
        count: results.length,
        min: null,
        max: null,
        avg: null,
      };
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, value) => sum + value, 0) / prices.length;

    return {
      count: results.length,
      min,
      max,
      avg,
    };
  }, [results]);

  return (
    <aside className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-black/30">
      <h2 className="mb-3 text-sm font-medium text-slate-100">Scan summary</h2>

      {!results.length || !stats ? (
        <p className="text-xs text-slate-500">
          No results yet. Run a scan to see marketplace items summarised here
          (counts, min/max prices, and average price).
        </p>
      ) : (
        <div className="space-y-2 text-xs text-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total results</span>
            <span className="font-mono text-sm">{stats.count}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Min price</span>
            <span className="font-mono text-sm">
              £ {stats.min?.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Max price</span>
            <span className="font-mono text-sm">
              £ {stats.max?.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Average price</span>
            <span className="font-mono text-sm">
              £ {stats.avg?.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {lastScanAt && (
        <p className="mt-3 text-[10px] text-slate-500">
          Last scan at{" "}
          <span className="font-mono">
            {new Date(lastScanAt).toLocaleTimeString()}
          </span>
        </p>
      )}
    </aside>
  );
};
