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
  UtensilsCrossed,
  Hotel,
  Car,
  Users,
  MapPin,
  Heart,
  Loader2,
  Filter,
  Upload,
  X,
  Image as ImageIcon,
  GripVertical,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { logger } from "@/lib/logger";

type ServiceRow = Tables<'services'>;
type ServiceInsert = TablesInsert<'services'>;
type ServiceUpdate = TablesUpdate<'services'>;

const SERVICE_CATEGORIES = [
  { value: 'accommodation', label: 'Accommodation', icon: Hotel },
  { value: 'food', label: 'Food & Dining', icon: UtensilsCrossed },
  { value: 'guide', label: 'Guide Services', icon: MapPin },
  { value: 'transport', label: 'Transport', icon: Car },
  { value: 'special', label: 'Special Services', icon: Heart },
  { value: 'community', label: 'Community', icon: Users },
  { value: 'support', label: 'Support', icon: Heart },
];

const defaultFormData: Partial<ServiceInsert> & { show_contact_after_booking?: boolean; contact_display_mode?: string } = {
  name: '',
  description: '',
  category: 'food',
  price: 0,
  currency: 'INR',
  duration_hours: null,
  max_capacity: 1,
  available_slots: 1,
  location: '',
  contact_phone: '',
  contact_email: '',
  amenities: [],
  images: [],
  is_active: true,
  show_contact_after_booking: true,
  contact_display_mode: 'both',
};

const ServicesManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceRow | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Partial<ServiceInsert>>(defaultFormData);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load services', { description: error.message });
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = !searchQuery.trim()
      ? true
      : service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? service.is_active :
      !service.is_active;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData(defaultFormData);
    setAmenitiesInput('');
    setImageUrls([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (service: ServiceRow) => {
    setEditingService(service);
    const serviceWithExtras = service as ServiceRow & { show_contact_after_booking?: boolean; contact_display_mode?: string };
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      currency: service.currency,
      duration_hours: service.duration_hours,
      max_capacity: service.max_capacity,
      available_slots: service.available_slots,
      location: service.location,
      contact_phone: service.contact_phone,
      contact_email: service.contact_email,
      amenities: service.amenities,
      images: service.images,
      is_active: service.is_active,
      show_contact_after_booking: serviceWithExtras.show_contact_after_booking ?? true,
      contact_display_mode: serviceWithExtras.contact_display_mode ?? 'both',
    });
    setAmenitiesInput((service.amenities || []).join(', '));
    setImageUrls(service.images || []);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (service: ServiceRow) => {
    setDeletingService(service);
    setIsDeleteOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `services/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('service-images')
          .getPublicUrl(filePath);

        return data.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error('Failed to upload image', { description: error.message });
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (urlToRemove: string) => {
    try {
      // Extract file path from URL
      const url = new URL(urlToRemove);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex((p) => p === 'service-images');
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        
        // Delete from storage
        await supabase.storage.from('service-images').remove([filePath]);
      }
    } catch (error) {
      logger.error('Error removing image from storage:', error);
    }

    // Remove from local state
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;
    
    // Reorder the images
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
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (formData.price === undefined || formData.price < 0) {
      toast.error('Valid price is required');
      return;
    }

    setSaving(true);

    // Parse amenities from comma-separated string
    const amenities = amenitiesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const serviceData = {
      ...formData,
      amenities,
      images: imageUrls,
    };

    try {
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData as ServiceUpdate)
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success('Service updated successfully');
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert(serviceData as ServiceInsert);

        if (error) throw error;
        toast.success('Service created successfully');
      }

      setIsFormOpen(false);
      fetchServices();
    } catch (error: any) {
      toast.error('Failed to save service', { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingService) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deletingService.id);

      if (error) throw error;
      toast.success('Service deleted successfully');
      setIsDeleteOpen(false);
      fetchServices();
    } catch (error: any) {
      toast.error('Failed to delete service', { description: error.message });
    }
  };

  const handleToggleActive = async (service: ServiceRow) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      toast.success(`Service ${service.is_active ? 'deactivated' : 'activated'}`);
      fetchServices();
    } catch (error: any) {
      toast.error('Failed to update service', { description: error.message });
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = SERVICE_CATEGORIES.find((c) => c.value === category);
    return cat?.icon || MapPin;
  };

  const getCategoryLabel = (category: string) => {
    const cat = SERVICE_CATEGORIES.find((c) => c.value === category);
    return cat?.label || category;
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
              <CardTitle>Services Management</CardTitle>
              <CardDescription>
                Manage accommodation, food, guides, transport and other services
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
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

          {/* Services Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => {
                    const CategoryIcon = getCategoryIcon(service.category);
                    return (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {service.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <CategoryIcon className="h-3 w-3" />
                            {getCategoryLabel(service.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {service.currency} {service.price}
                          </span>
                          {service.duration_hours && (
                            <span className="text-xs text-muted-foreground">
                              /{service.duration_hours}h
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {service.location || '—'}
                        </TableCell>
                        <TableCell>
                          {service.available_slots}/{service.max_capacity}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? 'default' : 'secondary'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(service)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(service)}
                            >
                              <Switch checked={service.is_active} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDelete(service)}
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
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Update service details below'
                : 'Fill in the details to create a new service'}
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
                  placeholder="Service name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category || 'food'}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
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
                placeholder="Describe the service..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency || 'INR'}
                  onValueChange={(v) => setFormData({ ...formData, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration_hours || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_hours: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_capacity">Max Capacity</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  min="1"
                  value={formData.max_capacity || 1}
                  onChange={(e) =>
                    setFormData({ ...formData, max_capacity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="available_slots">Available Slots</Label>
                <Input
                  id="available_slots"
                  type="number"
                  min="0"
                  value={formData.available_slots || 1}
                  onChange={(e) =>
                    setFormData({ ...formData, available_slots: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Service location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Contact Visibility Settings */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Contact Visibility (After Booking)</CardTitle>
                <CardDescription className="text-xs">
                  Control how users can contact the service provider after booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_contact">Show Contact After Booking</Label>
                    <p className="text-xs text-muted-foreground">Display phone number only after successful booking</p>
                  </div>
                  <Switch
                    id="show_contact"
                    checked={formData.show_contact_after_booking ?? true}
                    onCheckedChange={(v) => setFormData({ ...formData, show_contact_after_booking: v })}
                  />
                </div>
                
                {formData.show_contact_after_booking && (
                  <div className="space-y-2">
                    <Label htmlFor="contact_mode">Contact Display Mode</Label>
                    <Select
                      value={formData.contact_display_mode || 'both'}
                      onValueChange={(v) => setFormData({ ...formData, contact_display_mode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">📞 Call Only</SelectItem>
                        <SelectItem value="whatsapp">💬 WhatsApp Only</SelectItem>
                        <SelectItem value="both">📞💬 Call & WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="WiFi, AC, Parking, etc."
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Service Images</Label>
              
            {/* Image Preview Grid with Drag and Drop */}
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
                        alt={`Service image ${index + 1}`}
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

              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
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
                Supported formats: JPG, PNG, WebP. Max 5MB per image. Drag images to reorder.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active (visible to users)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingService ? 'Update Service' : 'Create Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingService?.name}"? This action cannot be
              undone. Any existing bookings for this service may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServicesManagement;
