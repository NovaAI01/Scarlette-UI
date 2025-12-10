export type MarketplaceKey = 'amazon' | 'ebay' | 'etsy';

export interface MarketplacesState {
  amazon: boolean;
  ebay: boolean;
  etsy: boolean;
}

export interface PrintfulCatalogItem {
  provider: 'printful';
  external_id: string;
  name: string;
  sku: string | null;
  currency: string | null;
  retail_price: number | string | null;
  image_url: string | null;
  tags: string[];
}

export interface RowState {
  externalId: string;
  targetPrice: string; // raw input string for the field
  marketplaces: MarketplacesState;
  isDirty: boolean; // true if user manually edited target price
}

export interface CatalogRow {
  item: PrintfulCatalogItem;
  state: RowState;
}

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'base-asc'
  | 'base-desc'
  | 'target-asc'
  | 'target-desc';

export type MarketplaceFilter = 'all' | MarketplaceKey;
export type TypeFilter = 'all' | string;

export interface SelectedItemSummary {
  externalId: string;
  name: string;
  imageUrl: string | null;
  currency: string | null;
  targetPrice: number;
  marketplaces: MarketplacesState;
}

export interface SelectionSummary {
  totalSelected: number;
  counts: Record<MarketplaceKey, number>;
  totals: Record<MarketplaceKey, number>;
  items: SelectedItemSummary[];
}

export interface SaveSelectionItem {
  provider: 'printful';
  external_id: string;
  name: string;
  image_url: string | null;
  currency: string | null;
  base_price: number | null;
  target_price: number | null;
  marketplaces: MarketplacesState;
  tags: string[];
}

export interface SaveSelectionPayload {
  items: SaveSelectionItem[];
  pricing_rule: number | null;
  created_at: string;
}

// ---- Helpers ----

export function parsePrice(
  value: number | string | null | undefined,
): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

export function getBasePrice(item: PrintfulCatalogItem): number | null {
  return parsePrice(item.retail_price);
}

export function parseTargetPrice(
  input: string | null | undefined,
): number | null {
  if (!input) return null;
  const num = Number(input);
  return Number.isFinite(num) ? num : null;
}

export function formatCurrency(
  value: number | null,
  currency?: string | null,
): string {
  if (value == null) return '—';
  const safeCurrency = currency ?? 'GBP';
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${safeCurrency} ${value.toFixed(2)}`;
  }
}
