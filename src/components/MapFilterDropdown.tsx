import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Droplets,
    Utensils,
    Car,
    Heart,
    ChevronDown,
    Filter,
    CheckCheck,
    MapPin,
    Bath,
    Mountain,
    Bed,
    Check,
} from 'lucide-react';
import type { Landmark } from '@/data/landmarks';
import { useLanguage } from '@/contexts/LanguageContext';

export interface FilterOption {
    id: Landmark['type'];
    labelKey: string;
    icon: React.ReactNode;
    dot: string; // small category-color dot
}

interface MapFilterDropdownProps {
    selectedFilters: Landmark['type'][];
    onApplyFilters: (filters: Landmark['type'][]) => void;
    onReset: () => void;
    onShowAll: () => void;
}

const filterOptions: FilterOption[] = [
    { id: 'temple',  labelKey: 'filter.temples', icon: <MapPin   className="h-4 w-4" />, dot: '#FF6B35' },
    { id: 'water',   labelKey: 'filter.water',   icon: <Droplets className="h-4 w-4" />, dot: '#06B6D4' },
    { id: 'food',    labelKey: 'filter.food',    icon: <Utensils className="h-4 w-4" />, dot: '#F59E0B' },
    { id: 'rest',    labelKey: 'filter.rest',    icon: <Mountain className="h-4 w-4" />, dot: '#8B5CF6' },
    { id: 'toilet',  labelKey: 'filter.toilets', icon: <Bath     className="h-4 w-4" />, dot: '#6B7280' },
    { id: 'medical', labelKey: 'filter.medical', icon: <Heart    className="h-4 w-4" />, dot: '#EF4444' },
    { id: 'parking', labelKey: 'filter.parking', icon: <Car      className="h-4 w-4" />, dot: '#10B981' },
    { id: 'rooms',   labelKey: 'filter.rooms',   icon: <Bed      className="h-4 w-4" />, dot: '#14B8A6' },
];

const MapFilterDropdown: React.FC<MapFilterDropdownProps> = ({
    selectedFilters,
    onApplyFilters,
    onReset,
    onShowAll,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();

    const [pendingFilters, setPendingFilters] = useState<Landmark['type'][]>(selectedFilters);

    useEffect(() => {
        if (isOpen) setPendingFilters(selectedFilters);
    }, [isOpen, selectedFilters]);

    const handleTogglePending = (filterId: Landmark['type']) => {
        setPendingFilters(prev =>
            prev.includes(filterId) ? prev.filter(t => t !== filterId) : [...prev, filterId]
        );
    };

    const handleCancel = () => { setPendingFilters(selectedFilters); setIsOpen(false); };
    const handleClear  = () => setPendingFilters([]);
    const handleApply  = () => { onApplyFilters(pendingFilters); setIsOpen(false); };
    const handleShowAll= () => setPendingFilters(filterOptions.map(f => f.id));

    const pendingCount  = pendingFilters.length;
    const allSelected   = pendingCount === filterOptions.length;
    const noneSelected  = pendingCount === 0;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* ── Filters trigger button ── */}
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm h-10 px-4 text-gray-700"
                    >
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{t('filter.title')}</span>
                        {selectedFilters.length > 0 && selectedFilters.length < filterOptions.length && (
                            <span className="bg-slate-700 text-white text-xs px-1.5 py-0.5 rounded-full font-bold leading-none">
                                {selectedFilters.length}
                            </span>
                        )}
                        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="start"
                    className="w-[92vw] max-w-[360px] p-0 bg-white border-gray-200 shadow-xl z-[1001] rounded-2xl overflow-hidden"
                    style={{ maxHeight: '70vh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    {/* Scrollable area */}
                    <div
                        className="overflow-y-auto overscroll-contain"
                        style={{ maxHeight: 'calc(70vh - 80px - env(safe-area-inset-bottom, 0px))' }}
                    >
                        <div className="p-4 pb-3">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    {t('filter.mapFilters')}
                                </h4>
                                <button
                                    onClick={handleShowAll}
                                    disabled={allSelected}
                                    className="text-xs text-slate-600 font-medium disabled:text-gray-300 hover:text-slate-800 transition-colors flex items-center gap-1"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    {t('filter.all')}
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 mb-3">
                                {t('filter.helperText') || 'Tap a category then press Apply'}
                            </p>

                            <DropdownMenuSeparator className="mb-3 bg-gray-100" />

                            {/* Filter grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {filterOptions.map((filter) => {
                                    const isSelected = pendingFilters.includes(filter.id);
                                    return (
                                        <button
                                            key={filter.id}
                                            onClick={() => handleTogglePending(filter.id)}
                                            className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.97] touch-manipulation border ${
                                                isSelected
                                                    ? 'bg-slate-100 border-slate-400 text-slate-800'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                                            }`}
                                        >
                                            {/* Category dot */}
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ background: filter.dot }}
                                            />
                                            <span className="text-sm font-medium leading-tight">
                                                {t(filter.labelKey)}
                                            </span>
                                            {isSelected && (
                                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                                                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Status line */}
                            <p className="mt-3 text-xs text-center text-gray-400">
                                {noneSelected
                                    ? `⚠️ ${t('filter.noFiltersSelected')}`
                                    : allSelected
                                        ? `✓ ${t('filter.showingAll')}`
                                        : t('filter.showingCount')
                                            .replace('{count}', pendingCount.toString())
                                            .replace('{total}', filterOptions.length.toString())}
                            </p>
                        </div>
                    </div>

                    {/* Sticky action bar */}
                    <div
                        className="sticky bottom-0 flex items-center justify-between px-3 py-2.5 bg-white border-t border-gray-100"
                        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))' }}
                    >
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleCancel}
                                className="h-8 px-3 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {t('filter.cancel') || 'Cancel'}
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={noneSelected}
                                className="h-8 px-3 text-xs font-medium text-red-400 hover:text-red-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('filter.clear')}
                            </button>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleApply}
                            className="h-8 px-5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-none rounded-lg"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            {t('filter.apply') || 'Apply'}
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ── Quick-filter pills (desktop) ── */}
            <div className="hidden md:flex items-center gap-1.5">
                {filterOptions.slice(0, 5).map((filter) => {
                    const isSelected = selectedFilters.includes(filter.id);
                    return (
                        <button
                            key={filter.id}
                            onClick={() => {
                                const newFilters = isSelected
                                    ? selectedFilters.filter(t => t !== filter.id)
                                    : [...selectedFilters, filter.id];
                                onApplyFilters(newFilters);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                isSelected
                                    ? 'text-white border-transparent shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            style={isSelected ? { backgroundColor: filter.dot, borderColor: filter.dot } : undefined}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-white/70' : ''}`}
                                style={!isSelected ? { background: filter.dot } : undefined}
                            />
                            <span className="hidden lg:inline">{t(filter.labelKey)}</span>
                            <span className="lg:hidden">
                                {React.cloneElement(filter.icon as React.ReactElement, { className: 'h-3.5 w-3.5' })}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MapFilterDropdown;
export { filterOptions };
