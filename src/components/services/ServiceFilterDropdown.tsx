import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  ArrowUpDown,
  DollarSign,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { ServiceFilters } from '@/types/services';

export type SortOption = 'price_low' | 'price_high' | 'name' | 'capacity';
export type PriceRange = 'all' | 'budget' | 'mid' | 'premium';

export interface ExtendedFilters extends ServiceFilters {
  sortBy?: SortOption;
  priceRange?: PriceRange;
  availableOnly?: boolean;
}

interface ServiceFilterDropdownProps {
  filters: ExtendedFilters;
  onFiltersChange: (filters: ExtendedFilters) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'capacity', label: 'Capacity: High to Low' },
];

const priceRanges: { value: PriceRange; label: string; icon: string }[] = [
  { value: 'all', label: 'All Prices', icon: '💰' },
  { value: 'budget', label: 'Budget (₹0-500)', icon: '🪙' },
  { value: 'mid', label: 'Mid-Range (₹500-2000)', icon: '💵' },
  { value: 'premium', label: 'Premium (₹2000+)', icon: '💎' },
];

const ServiceFilterDropdown: React.FC<ServiceFilterDropdownProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.sortBy && filters.sortBy !== 'name',
    filters.priceRange && filters.priceRange !== 'all',
    filters.availableOnly,
  ].filter(Boolean).length;

  const handleReset = () => {
    onFiltersChange({
      ...filters,
      sortBy: undefined,
      priceRange: 'all',
      availableOnly: false,
    });
  };

  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handlePriceRangeChange = (priceRange: PriceRange) => {
    onFiltersChange({ ...filters, priceRange });
  };

  const handleAvailableOnlyToggle = () => {
    onFiltersChange({ ...filters, availableOnly: !filters.availableOnly });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-card border-border hover:border-primary/40 shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 p-4 bg-card border-border shadow-xl z-50"
      >
        {/* Header with Reset */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filter & Sort
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-7 px-2 text-primary hover:text-primary"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* Sort Options */}
        <div className="mt-4">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground px-0 mb-2">
            <ArrowUpDown className="h-3 w-3" />
            Sort By
          </DropdownMenuLabel>
          <div className="grid grid-cols-1 gap-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${
                  filters.sortBy === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted text-foreground'
                }`}
              >
                <span>{option.label}</span>
                {filters.sortBy === option.value && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="my-4" />

        {/* Price Range */}
        <div>
          <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground px-0 mb-2">
            <DollarSign className="h-3 w-3" />
            Price Range
          </DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-2">
            {priceRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handlePriceRangeChange(range.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                  filters.priceRange === range.value
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/50 hover:bg-muted text-foreground'
                }`}
              >
                <span className="text-lg">{range.icon}</span>
                <span className="font-medium text-center">{range.label}</span>
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="my-4" />

        {/* Availability Toggle */}
        <div>
          <button
            onClick={handleAvailableOnlyToggle}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${
              filters.availableOnly
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 hover:bg-muted text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Available Only
            </span>
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                filters.availableOnly
                  ? 'border-primary-foreground bg-primary-foreground'
                  : 'border-muted-foreground'
              }`}
            >
              {filters.availableOnly && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          </button>
        </div>

        {/* Status */}
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            {activeFiltersCount === 0
              ? 'No filters applied'
              : `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServiceFilterDropdown;
