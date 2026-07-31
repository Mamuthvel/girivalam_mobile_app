import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Filter,
  Upload,
  X,
  Image as ImageIcon,
  GripVertical,
  UtensilsCrossed,
  Heart,
  Coffee,
  Store,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from "@/lib/logger";

interface FoodLocation {
  id: string;
  name: string;
  description: string | null;
  location_type: string;
  cuisine_type: string | null;
  is_free: boolean;
  price_range: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  timings: string | null;
  special_days: string | null;
  amenities: string[] | null;
  images: string[] | null;
  is_active: boolean;
  is_verified: boolean;
  distance_from_path: number | null;
  created_at: string;
  updated_at: string;
}

const LOCATION_TYPES = [
  { value: 'prasadam', label: 'Free Prasadam', icon: Heart },
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'street_food', label: 'Street Food', icon: Store },
  { value: 'cafe', label: 'Cafe', icon: Coffee },
];

const CUISINE_TYPES = [
  { value: 'south_indian', label: 'South Indian' },
  { value: 'north_indian', label: 'North Indian' },
  { value: 'multi_cuisine', label: 'Multi Cuisine' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'snacks', label: 'Snacks & Tiffin' },
  { value: 'sweets', label: 'Sweets' },
];

const PRICE_RANGES = [
  { value: 'free', label: 'Free' },
  { value: 'budget', label: 'Budget (₹1-50)' },
  { value: 'moderate', label: 'Moderate (₹50-150)' },
  { value: 'premium', label: 'Premium (₹150+)' },
];

const defaultFormData: Partial<FoodLocation> = {
  name: '',
  description: '',
  location_type: 'restaurant',
  cuisine_type: 'south_indian',
  is_free: false,
  price_range: 'budget',
  address: '',
  latitude: null,
  longitude: null,
  contact_phone: '',
  timings: '',
  special_days: '',
  amenities: [],
  images: [],
  is_active: true,
  is_verified: false,
  distance_from_path: null,
};

const FoodGuideManagement: React.FC = () => {
  const [locations, setLocations] = useState<FoodLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<FoodLocation | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<FoodLocation | null>(null);

  // Form data
  const [formData, setFormData] = useState<Partial<FoodLocation>>(defaultFormData);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('food_locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load food locations', { description: error.message });
    } else {
      setLocations(data || []);
    }
    setLoading(false);
  };

  const filteredLocations = locations.filter((location) => {
    const matchesSearch = !searchQuery.trim()
      ? true
      : location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.address || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || location.location_type === typeFilter;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? location.is_active
        : !location.is_active;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setFormData(defaultFormData);
    setAmenitiesInput('');
    setImageUrls([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (location: FoodLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description,
      location_type: location.location_type,
      cuisine_type: location.cuisine_type,
      is_free: location.is_free,
      price_range: location.price_range,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      contact_phone: location.contact_phone,
      timings: location.timings,
      special_days: location.special_days,
      amenities: location.amenities,
      images: location.images,
      is_active: location.is_active,
      is_verified: location.is_verified,
      distance_from_path: location.distance_from_path,
    });
    setAmenitiesInput((location.amenities || []).join(', '));
    setImageUrls(location.images || []);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (location: FoodLocation) => {
    setDeletingLocation(location);
    setIsDeleteOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `food-locations/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('service-images').getPublicUrl(filePath);
        return data.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error('Failed to upload image', { description: error.message });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (urlToRemove: string) => {
    try {
      const url = new URL(urlToRemove);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex((p) => p === 'service-images');
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        await supabase.storage.from('service-images').remove([filePath]);
      }
    } catch (error) {
      logger.error('Error removing image from storage:', error);
    }
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    setImageUrls((prev) => {
      const newUrls = [...prev];
      const draggedUrl = newUrls[draggedImageIndex];
      newUrls.splice(draggedImageIndex, 1);
      newUrls.splice(index, 0, draggedUrl);
      return newUrls;
    });
    setDraggedImageIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.location_type) {
      toast.error('Location type is required');
      return;
    }

    setSaving(true);

    const amenities = amenitiesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const locationData = {
      name: formData.name!,
      description: formData.description || null,
      location_type: formData.location_type || 'restaurant',
      cuisine_type: formData.cuisine_type || null,
      is_free: formData.is_free || false,
      price_range: formData.is_free ? 'free' : (formData.price_range || null),
      address: formData.address || null,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      contact_phone: formData.contact_phone || null,
      timings: formData.timings || null,
      special_days: formData.special_days || null,
      amenities,
      images: imageUrls,
      is_active: formData.is_active ?? true,
      is_verified: formData.is_verified ?? false,
      distance_from_path: formData.distance_from_path || null,
    };

    try {
      if (editingLocation) {
        const { error } = await supabase
          .from('food_locations')
          .update(locationData)
          .eq('id', editingLocation.id);

        if (error) throw error;
        toast.success('Food location updated successfully');
      } else {
        const { error } = await supabase.from('food_locations').insert([locationData]);

        if (error) throw error;
        toast.success('Food location created successfully');
      }

      setIsFormOpen(false);
      fetchLocations();
    } catch (error: any) {
      toast.error('Failed to save food location', { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLocation) return;

    try {
      const { error } = await supabase
        .from('food_locations')
        .delete()
        .eq('id', deletingLocation.id);

      if (error) throw error;
      toast.success('Food location deleted successfully');
      setIsDeleteOpen(false);
      fetchLocations();
    } catch (error: any) {
      toast.error('Failed to delete food location', { description: error.message });
    }
  };

  const handleToggleActive = async (location: FoodLocation) => {
    try {
      const { error } = await supabase
        .from('food_locations')
        .update({ is_active: !location.is_active })
        .eq('id', location.id);

      if (error) throw error;
      toast.success(`Location ${location.is_active ? 'deactivated' : 'activated'}`);
      fetchLocations();
    } catch (error: any) {
      toast.error('Failed to update location', { description: error.message });
    }
  };

  const handleToggleVerified = async (location: FoodLocation) => {
    try {
      const { error } = await supabase
        .from('food_locations')
        .update({ is_verified: !location.is_verified })
        .eq('id', location.id);

      if (error) throw error;
      toast.success(`Location ${location.is_verified ? 'unverified' : 'verified'}`);
      fetchLocations();
    } catch (error: any) {
      toast.error('Failed to update location', { description: error.message });
    }
  };

  const getTypeIcon = (type: string) => {
    const config = LOCATION_TYPES.find((t) => t.value === type);
    return config?.icon || UtensilsCrossed;
  };

  const getTypeLabel = (type: string) => {
    const config = LOCATION_TYPES.find((t) => t.value === type);
    return config?.label || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Food Guide Management</CardTitle>
              <CardDescription>
                Manage prasadam spots, restaurants, and food locations around Girivalam path
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search food locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No food locations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations.map((location) => {
                    const TypeIcon = getTypeIcon(location.location_type);
                    return (
                      <TableRow key={location.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{location.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {location.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`gap-1 ${
                              location.is_free ? 'bg-green-100 text-green-700' : ''
                            }`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {getTypeLabel(location.location_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {location.is_free ? (
                            <Badge variant="outline" className="text-green-600">
                              Free
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground capitalize">
                              {location.price_range || '—'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {location.address || '—'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVerified(location)}
                            className={location.is_verified ? 'text-green-600' : 'text-muted-foreground'}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge variant={location.is_active ? 'default' : 'secondary'}>
                            {location.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(location)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(location)}
                            >
                              <Switch checked={location.is_active} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDelete(location)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Food Location' : 'Add New Food Location'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? 'Update food location details below'
                : 'Fill in the details to add a new food location'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Location name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_type">Type *</Label>
                <Select
                  value={formData.location_type || 'restaurant'}
                  onValueChange={(v) => setFormData({ ...formData, location_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the food location..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisine_type">Cuisine Type</Label>
                <Select
                  value={formData.cuisine_type || 'south_indian'}
                  onValueChange={(v) => setFormData({ ...formData, cuisine_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_range">Price Range</Label>
                <Select
                  value={formData.is_free ? 'free' : formData.price_range || 'budget'}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      price_range: v,
                      is_free: v === 'free',
                    })
                  }
                  disabled={formData.is_free}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_free"
                checked={formData.is_free ?? false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_free: checked, price_range: checked ? 'free' : 'budget' })
                }
              />
              <Label htmlFor="is_free">Free Prasadam / Anna Dhanam</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone || ''}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timings">Timings</Label>
                <Input
                  id="timings"
                  value={formData.timings || ''}
                  onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                  placeholder="6 AM - 9 PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance from Path (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.distance_from_path || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      distance_from_path: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="0.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_days">Special Days</Label>
              <Input
                id="special_days"
                value={formData.special_days || ''}
                onChange={(e) => setFormData({ ...formData, special_days: e.target.value })}
                placeholder="Pournami, Festivals, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="Seating, AC, Parking, etc."
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Images</Label>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imageUrls.map((url, index) => (
                    <div
                      key={url}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative group aspect-video rounded-lg overflow-hidden border cursor-move transition-all ${
                        draggedImageIndex === index
                          ? 'ring-2 ring-primary opacity-50'
                          : 'hover:ring-2 hover:ring-primary/50'
                      }`}
                    >
                      <div className="absolute top-1 left-1 p-1 bg-background/80 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-background/80 backdrop-blur-sm rounded text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </div>
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="food-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="gap-2"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingImage ? 'Uploading...' : 'Upload Images'}
                </Button>
                {imageUrls.length === 0 && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    No images uploaded
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WebP. Max 5MB per image. Drag to reorder.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_verified"
                  checked={formData.is_verified ?? false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                />
                <Label htmlFor="is_verified">Verified</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingLocation ? 'Update Location' : 'Create Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingLocation?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FoodGuideManagement;
