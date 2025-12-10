'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Toolbar } from './components/Toolbar';
import { ProductTable } from './components/ProductTable';
import { SelectionSidebar } from './components/SelectionSidebar';
import {
  CatalogRow,
  MarketplaceFilter,
  MarketplaceKey,
  PrintfulCatalogItem,
  RowState,
  SaveSelectionPayload,
  SelectionSummary,
  SortOption,
  TypeFilter,
  getBasePrice,
  parseTargetPrice,
} from './types';

const DEFAULT_PRICING_RULE = '2.2';

const createDefaultRowState = (externalId: string): RowState => ({
  externalId,
  targetPrice: '',
  marketplaces: {
    amazon: false,
    ebay: false,
    etsy: false,
  },
  isDirty: false,
});

const buildSelectionSummary = (
  catalog: PrintfulCatalogItem[],
  rowsState: Record<string, RowState>,
): SelectionSummary => {
  const counts: SelectionSummary['counts'] = {
    amazon: 0,
    ebay: 0,
    etsy: 0,
  };
  const totals: SelectionSummary['totals'] = {
    amazon: 0,
    ebay: 0,
    etsy: 0,
  };
  const items: SelectionSummary['items'] = [];

  for (const item of catalog) {
    const state = rowsState[item.external_id];
    if (!state) continue;

    const targetPrice = parseTargetPrice(state.targetPrice);
    if (targetPrice == null || targetPrice <= 0) continue;

    const marketplaces = state.marketplaces;
    const hasAnyMarketplace =
      marketplaces.amazon ||
      marketplaces.ebay ||
      marketplaces.etsy;

    if (!hasAnyMarketplace) continue;

    (['amazon', 'ebay', 'etsy'] as MarketplaceKey[]).forEach(
      (mp) => {
        if (marketplaces[mp]) {
          counts[mp] += 1;
          totals[mp] += targetPrice;
        }
      },
    );

    items.push({
      externalId: item.external_id,
      name: item.name,
      imageUrl: item.image_url,
      currency: item.currency,
      targetPrice,
      marketplaces: { ...marketplaces },
    });
  }

  const totalSelected = items.length;

  return {
    totalSelected,
    counts,
    totals,
    items,
  };
};

const buildSaveSelectionPayload = (
  catalog: PrintfulCatalogItem[],
  rowsState: Record<string, RowState>,
  pricingRule: string,
): SaveSelectionPayload => {
  const items: SaveSelectionPayload['items'] = [];

  for (const item of catalog) {
    const state = rowsState[item.external_id];
    if (!state) continue;

    const targetPrice = parseTargetPrice(state.targetPrice);
    const hasAnyMarketplace =
      state.marketplaces.amazon ||
      state.marketplaces.ebay ||
      state.marketplaces.etsy;

    if (!hasAnyMarketplace && targetPrice == null) {
      continue;
    }

    items.push({
      provider: 'printful',
      external_id: item.external_id,
      name: item.name,
      image_url: item.image_url,
      currency: item.currency,
      base_price: getBasePrice(item),
      target_price: targetPrice,
      marketplaces: { ...state.marketplaces },
      tags: [...item.tags],
    });
  }

  const parsedRule = Number(pricingRule);
  const pricing_rule =
    Number.isFinite(parsedRule) && parsedRule > 0
      ? parsedRule
      : null;

  return {
    items,
    pricing_rule,
    created_at: new Date().toISOString(),
  };
};

const PrintfulCatalogPage: React.FC = () => {
  const [catalog, setCatalog] = useState<PrintfulCatalogItem[]>([]);
  const [rowsState, setRowsState] = useState<
    Record<string, RowState>
  >({});

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] =
    useState<TypeFilter>('all');
  const [marketplaceFilter, setMarketplaceFilter] =
    useState<MarketplaceFilter>('all');
  const [sortOption, setSortOption] =
    useState<SortOption>('name-asc');
  const [globalPricingRule, setGlobalPricingRule] =
    useState<string>(DEFAULT_PRICING_RULE);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/printful/catalog');
      if (!response.ok) {
        throw new Error(
          `Failed to load catalog: ${response.status}`,
        );
      }

      const data = (await response.json()) as {
        items: PrintfulCatalogItem[];
      };

      const items = data.items ?? [];
      setCatalog(items);

      setRowsState((prev) => {
        const next: Record<string, RowState> = { ...prev };
        for (const item of items) {
          if (!next[item.external_id]) {
            const basePrice = getBasePrice(item);
            next[item.external_id] = {
              ...createDefaultRowState(item.external_id),
              targetPrice:
                basePrice != null
                  ? basePrice.toFixed(2)
                  : '',
            };
          }
        }
        return next;
      });
    } catch (err) {
      console.error('[PrintfulCatalog] Load error', err);
      setError('Failed to load Printful catalog.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const availableTypes: string[] = useMemo(() => {
    const set = new Set<string>();
    for (const item of catalog) {
      for (const tag of item.tags) {
        if (tag && tag.trim()) {
          set.add(tag);
        }
      }
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [catalog]);

  const visibleRows: CatalogRow[] = useMemo(() => {
    let rows: CatalogRow[] = catalog.map((item) => {
      const state =
        rowsState[item.external_id] ??
        createDefaultRowState(item.external_id);
      return { item, state };
    });

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      rows = rows.filter(({ item }) => {
        const nameMatch = item.name
          .toLowerCase()
          .includes(q);
        const idMatch = item.external_id
          .toLowerCase()
          .includes(q);
        const tagsMatch = item.tags.some((tag) =>
          tag.toLowerCase().includes(q),
        );
        return nameMatch || idMatch || tagsMatch;
      });
    }

    if (typeFilter !== 'all') {
      const tf = typeFilter.toLowerCase();
      rows = rows.filter(({ item }) =>
        item.tags.some(
          (tag) => tag.toLowerCase() === tf,
        ),
      );
    }

    if (marketplaceFilter !== 'all') {
      rows = rows.filter(
        ({ state }) =>
          state.marketplaces[marketplaceFilter],
      );
    }

    const byNameAsc = (a: CatalogRow, b: CatalogRow) =>
      a.item.name.localeCompare(b.item.name);

    const byBase = (a: CatalogRow, b: CatalogRow) => {
      const av = getBasePrice(a.item);
      const bv = getBasePrice(b.item);
      const aVal = av ?? Number.POSITIVE_INFINITY;
      const bVal = bv ?? Number.POSITIVE_INFINITY;
      return aVal - bVal;
    };

    const byTarget = (a: CatalogRow, b: CatalogRow) => {
      const av = parseTargetPrice(a.state.targetPrice);
      const bv = parseTargetPrice(b.state.targetPrice);
      const aVal = av ?? Number.POSITIVE_INFINITY;
      const bVal = bv ?? Number.POSITIVE_INFINITY;
      return aVal - bVal;
    };

    switch (sortOption) {
      case 'name-asc':
        rows.sort(byNameAsc);
        break;
      case 'name-desc':
        rows.sort((a, b) => byNameAsc(b, a));
        break;
      case 'base-asc':
        rows.sort(byBase);
        break;
      case 'base-desc':
        rows.sort((a, b) => byBase(b, a));
        break;
      case 'target-asc':
        rows.sort(byTarget);
        break;
      case 'target-desc':
        rows.sort((a, b) => byTarget(b, a));
        break;
      default:
        break;
    }

    return rows;
  }, [
    catalog,
    rowsState,
    searchTerm,
    typeFilter,
    marketplaceFilter,
    sortOption,
  ]);

  const selectionSummary: SelectionSummary = useMemo(
    () => buildSelectionSummary(catalog, rowsState),
    [catalog, rowsState],
  );

  const handleMarketplaceToggle = useCallback(
    (
      externalId: string,
      marketplace: MarketplaceKey,
      value: boolean,
    ) => {
      setRowsState((prev) => {
        const prevRow =
          prev[externalId] ?? createDefaultRowState(externalId);
        const nextRow: RowState = {
          ...prevRow,
          marketplaces: {
            ...prevRow.marketplaces,
            [marketplace]: value,
          },
        };

        return {
          ...prev,
          [externalId]: nextRow,
        };
      });
    },
    [],
  );

  const handleTargetPriceChange = useCallback(
    (externalId: string, value: string) => {
      setRowsState((prev) => {
        const prevRow =
          prev[externalId] ?? createDefaultRowState(externalId);
        const nextRow: RowState = {
          ...prevRow,
          targetPrice: value,
          isDirty: true,
        };

        return {
          ...prev,
          [externalId]: nextRow,
        };
      });
    },
    [],
  );

  const handleApplyGlobalPricingRule = useCallback(() => {
    const multiplier = Number(globalPricingRule);
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      return;
    }

    setRowsState((prev) => {
      const next: Record<string, RowState> = {
        ...prev,
      };

      for (const row of visibleRows) {
        const item = row.item;
        const basePrice = getBasePrice(item);
        if (basePrice == null) continue;

        const existing =
          next[item.external_id] ??
          createDefaultRowState(item.external_id);

        if (existing.isDirty) {
          continue;
        }

        const target = basePrice * multiplier;
        next[item.external_id] = {
          ...existing,
          targetPrice: target.toFixed(2),
        };
      }

      return next;
    });
  }, [globalPricingRule, visibleRows]);

  const handleClearSelection = useCallback(() => {
    setRowsState((prev) => {
      const next: Record<string, RowState> = {};
      for (const [externalId, row] of Object.entries(prev)) {
        next[externalId] = {
          ...row,
          marketplaces: {
            amazon: false,
            ebay: false,
            etsy: false,
          },
          // Keep targetPrice as-is for now; easier UX.
        };
      }
      return next;
    });
  }, []);

  const handleDeselectItem = useCallback(
    (externalId: string) => {
      setRowsState((prev) => {
        const row =
          prev[externalId] ??
          createDefaultRowState(externalId);
        return {
          ...prev,
          [externalId]: {
            ...row,
            marketplaces: {
              amazon: false,
              ebay: false,
              etsy: false,
            },
          },
        };
      });
    },
    [],
  );

  const handleSaveSelection = useCallback(() => {
    const payload = buildSaveSelectionPayload(
      catalog,
      rowsState,
      globalPricingRule,
    );

    // For this iteration we only log to the console.
    // Next iteration we will POST to /api/printful/selection
    // and add proper loading / success / error UI.
    // eslint-disable-next-line no-console
    console.log(
      '[PrintfulCatalog] Save selection payload',
      payload,
    );
  }, [catalog, rowsState, globalPricingRule]);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <Toolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        availableTypes={availableTypes}
        marketplaceFilter={marketplaceFilter}
        onMarketplaceFilterChange={
          setMarketplaceFilter
        }
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        globalPricingRule={globalPricingRule}
        onGlobalPricingRuleChange={setGlobalPricingRule}
        onApplyGlobalPricingRule={
          handleApplyGlobalPricingRule
        }
        isApplyDisabled={
          isLoading || visibleRows.length === 0
        }
      />

      <div className="mx-auto flex min-h-0 flex-1 w-full max-w-7xl gap-4 px-4 pb-4 pt-3">
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-800 bg-slate-900/80">
          <ProductTable
            rows={visibleRows}
            totalCount={catalog.length}
            isLoading={isLoading}
            error={error}
            onRetry={loadCatalog}
            onMarketplaceToggle={handleMarketplaceToggle}
            onTargetPriceChange={handleTargetPriceChange}
          />
        </div>

        <div className="hidden w-80 flex-shrink-0 md:block">
          <SelectionSidebar
            selection={selectionSummary}
            onClearSelection={handleClearSelection}
            onDeselectItem={handleDeselectItem}
            onSaveSelection={handleSaveSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default PrintfulCatalogPage;
