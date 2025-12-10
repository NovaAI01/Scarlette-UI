import React from 'react';
import {
  MarketplaceFilter,
  SortOption,
  TypeFilter,
} from '../types';

export interface ToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  availableTypes: string[];
  marketplaceFilter: MarketplaceFilter;
  onMarketplaceFilterChange: (value: MarketplaceFilter) => void;
  sortOption: SortOption;
  onSortOptionChange: (value: SortOption) => void;
  globalPricingRule: string;
  onGlobalPricingRuleChange: (value: string) => void;
  onApplyGlobalPricingRule: () => void;
  isApplyDisabled: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchTerm,
  onSearchTermChange,
  typeFilter,
  onTypeFilterChange,
  availableTypes,
  marketplaceFilter,
  onMarketplaceFilterChange,
  sortOption,
  onSortOptionChange,
  globalPricingRule,
  onGlobalPricingRuleChange,
  onApplyGlobalPricingRule,
  isApplyDisabled,
}) => {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
        {/* Left cluster: search + filters */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Search products, tags, IDs…"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={typeFilter}
            onChange={(e) =>
              onTypeFilterChange(
                e.target.value === 'all' ? 'all' : e.target.value,
              )
            }
          >
            <option value="all">All types</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={marketplaceFilter}
            onChange={(e) =>
              onMarketplaceFilterChange(
                e.target.value as MarketplaceFilter,
              )
            }
          >
            <option value="all">All marketplaces</option>
            <option value="amazon">Amazon</option>
            <option value="ebay">eBay</option>
            <option value="etsy">Etsy</option>
          </select>

          <select
            className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={sortOption}
            onChange={(e) =>
              onSortOptionChange(e.target.value as SortOption)
            }
          >
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="base-asc">Base cost ↑</option>
            <option value="base-desc">Base cost ↓</option>
            <option value="target-asc">Target price ↑</option>
            <option value="target-desc">Target price ↓</option>
          </select>
        </div>

        {/* Right cluster: global pricing rule */}
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Global pricing rule
            </span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={globalPricingRule}
              onChange={(e) =>
                onGlobalPricingRuleChange(e.target.value)
              }
              className="w-20 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-500">× base cost</span>
          </div>
          <button
            type="button"
            onClick={onApplyGlobalPricingRule}
            disabled={isApplyDisabled}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            Apply to visible rows
          </button>
        </div>
      </div>
    </div>
  );
};
