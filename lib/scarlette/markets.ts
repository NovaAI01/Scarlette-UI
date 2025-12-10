// lib/scarlette/markets.ts

export type Marketplace = "ebay_uk" | "amazon_uk" | "etsy";

export interface MarketScanRequest {
  marketplace: Marketplace;
  keyword: string;
  min_price?: number;
  max_price?: number;
}

export interface MarketResultItem {
  id: string;
  title: string;
  thumbnail_url?: string;
  price: number;
  currency: string;
  shipping_cost?: number | null;
  marketplace: Marketplace;
  url: string;
  // Additional backend fields are preserved in raw payload.
}

export interface MarketScanResponse {
  items: MarketResultItem[];
  raw: unknown;
}

const DEFAULT_API_BASE = "http://127.0.0.1:8000";

function getApiBase(): string {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SCARLETTE_API_BASE
  ) {
    return process.env.NEXT_PUBLIC_SCARLETTE_API_BASE;
  }
  return DEFAULT_API_BASE;
}

/**
 * Calls the ScarletteOS backend /os/markets/scan endpoint.
 * Strategy:
 *  - First try POST with JSON body (preferred).
 *  - If the server returns 405 Method Not Allowed, fall back to GET with query params.
 */
export async function scanMarkets(
  payload: MarketScanRequest
): Promise<MarketScanResponse> {
  const apiBase = getApiBase();

  // --- 1) Try POST first ---
  let response = await fetch(`${apiBase}/os/markets/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // If POST is not allowed, fall back to GET.
  if (response.status === 405) {
    const params = new URLSearchParams();
    params.set("marketplace", payload.marketplace);
    params.set("keyword", payload.keyword);
    if (typeof payload.min_price === "number") {
      params.set("min_price", String(payload.min_price));
    }
    if (typeof payload.max_price === "number") {
      params.set("max_price", String(payload.max_price));
    }

    response = await fetch(`${apiBase}/os/markets/scan?${params.toString()}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Market scan failed (${response.status}) ${
        text ? `- ${text.slice(0, 200)}` : ""
      }`
    );
  }

  const data: any = await response.json().catch(() => ({}));

  const items: MarketResultItem[] =
    (data.items as MarketResultItem[]) ??
    (data.results as MarketResultItem[]) ??
    [];

  return {
    items,
    raw: data,
  };
}

/**
 * Shape for passing a Markets item into Pricing OS.
 */
export interface PricingSeedItem {
  source: "markets";
  marketplace: Marketplace;
  external_id: string;
  title: string;
  price: number;
  currency: string;
  url: string;
  shipping_cost?: number | null;
}

export const PRICING_SEED_STORAGE_KEY = "scarlette_pricing_seed";

/**
 * Writes a seed object for Pricing OS into sessionStorage.
 */
export function sendMarketItemToPricingOS(item: MarketResultItem): void {
  if (typeof window === "undefined") return;

  const seed: PricingSeedItem = {
    source: "markets",
    marketplace: item.marketplace,
    external_id: item.id,
    title: item.title,
    price: item.price,
    currency: item.currency,
    url: item.url,
    shipping_cost: item.shipping_cost ?? null,
  };

  try {
    window.sessionStorage.setItem(PRICING_SEED_STORAGE_KEY, JSON.stringify(seed));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to write Pricing OS seed to sessionStorage", err);
  }
}

/**
 * Reads and parses the Pricing OS seed from sessionStorage.
 */
export function readPricingSeedFromStorage(): PricingSeedItem | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PRICING_SEED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PricingSeedItem;

    if (
      !parsed ||
      parsed.source !== "markets" ||
      typeof parsed.title !== "string" ||
      typeof parsed.price !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to read Pricing OS seed from sessionStorage", err);
    return null;
  }
}
