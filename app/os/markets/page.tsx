"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  scanMarkets,
  sendMarketItemToPricingOS,
  type Marketplace,
  type MarketResultItem,
} from "@/lib/scarlette/markets";
import {
  MarketsFilters,
  type MarketsFiltersState,
} from "@/components/markets/MarketsFilters";
import { MarketsResultsSummary } from "@/components/markets/MarketsResultsSummary";
import { MarketsResultsTable } from "@/components/markets/MarketsResultsTable";
import { MarketsDebugPanel } from "@/components/markets/MarketsDebugPanel";

const MarketsPage: React.FC = () => {
  const router = useRouter();

  const [filters, setFilters] = useState<MarketsFiltersState>({
    marketplace: "ebay_uk",
    keyword: "",
    minPrice: "",
    maxPrice: "",
  });

  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<MarketResultItem[]>([]);
  const [rawResponse, setRawResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);

  const handleFilterChange = (
    field: keyof MarketsFiltersState,
    value: string
  ): void => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setIsScanning(true);

    try {
      const minPriceNumber =
        filters.minPrice.trim() === "" ? undefined : Number(filters.minPrice);
      const maxPriceNumber =
        filters.maxPrice.trim() === "" ? undefined : Number(filters.maxPrice);

      const payload = {
        marketplace: filters.marketplace as Marketplace,
        keyword: filters.keyword.trim(),
        min_price:
          typeof minPriceNumber === "number" && !Number.isNaN(minPriceNumber)
            ? minPriceNumber
            : undefined,
        max_price:
          typeof maxPriceNumber === "number" && !Number.isNaN(maxPriceNumber)
            ? maxPriceNumber
            : undefined,
      };

      const { items, raw } = await scanMarkets(payload);

      setResults(items ?? []);
      setRawResponse(raw);
      setLastScanAt(new Date().toISOString());
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to run market scan. Please try again."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleSendToPricing = (item: MarketResultItem) => {
    sendMarketItemToPricingOS(item);
    router.push("/os/pricing");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        {/* Header */}
        <header className="flex flex-col gap-2 border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Markets OS
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Scan marketplaces for products by keyword and price range, then
            route promising items directly into Pricing OS for margin analysis.
          </p>
        </header>

        {/* Controls + Summary */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <MarketsFilters
            filters={filters}
            isScanning={isScanning}
            lastScanAt={lastScanAt}
            error={error}
            onChange={handleFilterChange}
            onSubmit={handleSubmit}
          />
          <MarketsResultsSummary results={results} lastScanAt={lastScanAt} />
        </section>

        {/* Results table */}
        <MarketsResultsTable
          results={results}
          onSendToPricing={handleSendToPricing}
        />

        {/* Raw JSON debug */}
        <MarketsDebugPanel rawResponse={rawResponse} />
      </div>
    </div>
  );
};

export default MarketsPage;
