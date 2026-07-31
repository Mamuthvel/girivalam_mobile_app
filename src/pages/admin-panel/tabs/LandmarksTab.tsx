import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { Search, Database, RefreshCw, Plus } from 'lucide-react';
import type { LandmarkFormValues } from '@/schemas/landmark.schema';
import LandmarkForm from '../LandmarkForm';
import LandmarkCsvImport from '../LandmarkCsvImport';
import LandmarkTable from '../LandmarkTable';
import type { LandmarkRow, LandmarkStatusFilter, LandmarkSort } from '../adminTypes';

interface LandmarksTabProps {
  seeding: boolean;
  onSeed: () => void;
  landmarkSearch: string;
  setLandmarkSearch: Dispatch<SetStateAction<string>>;
  landmarkTypeFilter: string;
  setLandmarkTypeFilter: Dispatch<SetStateAction<string>>;
  landmarkStatusFilter: LandmarkStatusFilter;
  setLandmarkStatusFilter: Dispatch<SetStateAction<LandmarkStatusFilter>>;
  landmarkSort: LandmarkSort;
  setLandmarkSort: Dispatch<SetStateAction<LandmarkSort>>;
  filteredLandmarks: LandmarkRow[];
  setEditingLandmark: Dispatch<SetStateAction<LandmarkRow | null>>;
  toggleLandmarkStatus: (l: LandmarkRow) => void;
  deleteLandmark: (id: number) => void;
  isAddLandmarkOpen: boolean;
  setIsAddLandmarkOpen: Dispatch<SetStateAction<boolean>>;
  createLandmark: (formData: LandmarkFormValues) => Promise<void>;
  landmarkLoading: boolean;
  editingLandmark: LandmarkRow | null;
  updateLandmark: (formData: LandmarkFormValues) => Promise<void>;
}

const LandmarksTab = ({
  seeding,
  onSeed,
  landmarkSearch,
  setLandmarkSearch,
  landmarkTypeFilter,
  setLandmarkTypeFilter,
  landmarkStatusFilter,
  setLandmarkStatusFilter,
  landmarkSort,
  setLandmarkSort,
  filteredLandmarks,
  setEditingLandmark,
  toggleLandmarkStatus,
  deleteLandmark,
  isAddLandmarkOpen,
  setIsAddLandmarkOpen,
  createLandmark,
  landmarkLoading,
  editingLandmark,
  updateLandmark,
}: LandmarksTabProps) => (
  <TabsContent value="landmarks" className="space-y-4">
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Landmarks</h2>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={seeding}
            onClick={onSeed}
          >
            {seeding ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Seed Default Data
          </Button>
          <Button onClick={() => setIsAddLandmarkOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Landmark
          </Button>
          <LandmarkCsvImport />
        </div>
      </div>

      {/* 🔎 Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative w-64">
          <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by name..."
            value={landmarkSearch}
            onChange={(e) => setLandmarkSearch(e.target.value)}
          />
        </div>

        {/* Type */}
        <Select
          value={landmarkTypeFilter}
          onValueChange={setLandmarkTypeFilter}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="temple">Temple</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="rest">Rest</SelectItem>
            <SelectItem value="toilet">Toilet</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
            <SelectItem value="parking">Parking</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={landmarkStatusFilter}
          onValueChange={(v) => setLandmarkStatusFilter(v as LandmarkStatusFilter)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={landmarkSort}
          onValueChange={(v) => setLandmarkSort(v as LandmarkSort)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Updated</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLandmarkSearch('');
            setLandmarkTypeFilter('all');
            setLandmarkStatusFilter('all');
            setLandmarkSort('recent');
          }}
        >
          Reset Filters
        </Button>
      </div>

      <LandmarkTable
        data={filteredLandmarks}
        onEdit={setEditingLandmark}
        onToggle={toggleLandmarkStatus}
        onDelete={deleteLandmark}
      />
    </div>

    {/* Add Landmark Dialog */}
    <Dialog open={isAddLandmarkOpen} onOpenChange={setIsAddLandmarkOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Landmark</DialogTitle>
          <DialogDescription>
            Create a new landmark on the map
          </DialogDescription>
        </DialogHeader>
        <LandmarkForm
          onSubmit={createLandmark}
          loading={landmarkLoading}
        />
      </DialogContent>
    </Dialog>

    {/* Edit Landmark Dialog */}
    <Dialog open={!!editingLandmark} onOpenChange={(open) => !open && setEditingLandmark(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Landmark</DialogTitle>
          <DialogDescription>
            Update landmark details
          </DialogDescription>
        </DialogHeader>
        {editingLandmark && (
          <LandmarkForm
            defaultValues={{
              name: editingLandmark.name,
              lat: editingLandmark.lat,
              lng: editingLandmark.lng,
              type: editingLandmark.type as any,
              direction: editingLandmark.direction as any,
              description: editingLandmark.description ?? undefined,
              timings: editingLandmark.timings ?? undefined,
              facilities: editingLandmark.facilities ?? undefined,
              animation_type: editingLandmark.animation_type as any,
              is_active: editingLandmark.is_active ?? true,
              // Aṣṭa Lingam fields
              is_ashta_lingam: editingLandmark.is_ashta_lingam ?? false,
              enable_glow: editingLandmark.enable_glow ?? true,
              enable_aura_pulse: editingLandmark.enable_aura_pulse ?? true,
              enable_snake_animation: editingLandmark.enable_snake_animation ?? false,
              premium_glow: editingLandmark.premium_glow ?? false,
              glow_color: editingLandmark.glow_color ?? '#FFDFA3',
              aura_color: editingLandmark.aura_color ?? '#FFF2CC',
              icon_size: (editingLandmark.icon_size as any) ?? 'medium',
            }}
            onSubmit={updateLandmark}
            loading={landmarkLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  </TabsContent>
);

export default LandmarksTab;
