import React from "react";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ServiceCard, BookingDialog, ServiceCategoryTabs, ServiceFilterDropdown, ExtendedFilters } from "@/components/services";
import { useServices } from "@/hooks/useServices";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthPreview } from "@/components/AuthPreview";
import { ServicesTeaser } from "@/components/previews/ServicesTeaser";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bed,
  AlertCircle,
  Search,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";

const SERVICES_PREVIEW_FEATURES = [
  "Book accommodation near Arunachala",
  "Find trusted local guides",
  "Book transportation services",
  "View your booking history"
];

const Services = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    filteredServices,
    categories,
    isLoading,
    filters,
    setFilters,
    selectedService,
    bookingForm,
    isBookingDialogOpen,
    isSubmitting,
    validationErrors,
    openBookingDialog,
    closeBookingDialog,
    updateBookingForm,
    submitBooking
  } = useServices();

  // Extended filters state for sort, price range, availability, and search
  const [extendedFilters, setExtendedFilters] = React.useState<ExtendedFilters>({
    category: filters.category,
    sortBy: undefined,
    priceRange: 'all',
    availableOnly: false,
    searchQuery: '',
  });
  
  // Only booking tab is now used
  const [activeTab, setActiveTab] = React.useState("booking");

  // Sync category filter with useServices
  React.useEffect(() => {
    setFilters({ ...filters, category: extendedFilters.category });
  }, [extendedFilters.category]);

  // Apply extended filtering and sorting
  const displayServices = React.useMemo(() => {
    let result = [...filteredServices];

    // Filter by search query
    if (extendedFilters.searchQuery && extendedFilters.searchQuery.trim()) {
      const query = extendedFilters.searchQuery.toLowerCase().trim();
      result = result.filter((service) =>
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.location?.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    if (extendedFilters.priceRange && extendedFilters.priceRange !== 'all') {
      result = result.filter((service) => {
        switch (extendedFilters.priceRange) {
          case 'budget':
            return service.price <= 500;
          case 'mid':
            return service.price > 500 && service.price <= 2000;
          case 'premium':
            return service.price > 2000;
          default:
            return true;
        }
      });
    }

    // Filter by availability
    if (extendedFilters.availableOnly) {
      result = result.filter((service) => service.available_slots > 0);
    }

    // Sort
    if (extendedFilters.sortBy) {
      result.sort((a, b) => {
        switch (extendedFilters.sortBy) {
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'capacity':
            return b.max_capacity - a.max_capacity;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [filteredServices, extendedFilters]);

  // Show auth preview for non-authenticated users
  if (!authLoading && !user) {
    return (
      <>
        <Helmet>
          <title>Services & Booking - Girivalam Tiruvannamalai | Arunachala Vibe</title>
          <meta name="description" content="Book accommodation, food, guides, and transportation for your sacred Girivalam journey around Arunachala. Find trusted services in Tiruvannamalai." />
        </Helmet>
        <div className="min-h-screen bg-background pt-20 md:pt-24">
          <SiteHeader />
          <AuthPreview
            title="Sacred Services & Booking"
            description="Sign in to book accommodation, guides, and transportation for your Girivalam journey."
            features={SERVICES_PREVIEW_FEATURES}
            icon={<Bed className="h-8 w-8 text-primary" />}
            backgroundContent={<ServicesTeaser />}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Girivalam Services & Booking — Tiruvannamalai | MyGirivalam.in</title>
        <meta name="description" content="Book accommodation, food, guides, and transportation for your sacred Girivalam journey in Tiruvannamalai. Trusted services for Arunachala pilgrims." />
        <link rel="canonical" href="https://mygirivalam.in/girivalam-services" />
      </Helmet>

      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <SiteHeader />

        {/* Header */}
        <section className="px-4 py-12 md:py-16">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
              🏛️ Sacred Services
            </Badge>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Services & 
              <span className="block text-primary">Booking</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Everything you need for a comfortable and blessed Girivalam journey. 
              Book accommodation, guides, meals, and transportation with ease.
            </p>
          </div>
        </section>

        {/* Main Content with Tabs */}
        <div className="px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            <Tabs 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Single primary action - Book Now */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Bed className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Our Services</span>
                </div>
              </div>

              {/* Booking Tab - Dynamic Services */}
              <TabsContent value="booking" className="space-y-6">
                {/* Search and Filters Row */}
                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search services by name, description, or location..."
                      value={extendedFilters.searchQuery || ''}
                      onChange={(e) => setExtendedFilters({ ...extendedFilters, searchQuery: e.target.value })}
                      className="pl-10 pr-10 h-11 bg-card border-border"
                    />
                    {extendedFilters.searchQuery && (
                      <button
                        onClick={() => setExtendedFilters({ ...extendedFilters, searchQuery: '' })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Category and Filter Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Category Filter */}
                    {categories.length > 0 && (
                      <ServiceCategoryTabs
                        value={extendedFilters.category}
                        onValueChange={(category) => setExtendedFilters({ ...extendedFilters, category })}
                        categories={categories}
                      />
                    )}
                    
                    {/* Filter Dropdown */}
                    <ServiceFilterDropdown
                      filters={extendedFilters}
                      onFiltersChange={setExtendedFilters}
                    />
                  </div>
                </div>

                {/* Services Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : displayServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBook={openBookingDialog}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                    <p className="text-muted-foreground">
                      {extendedFilters.searchQuery
                        ? `No services match "${extendedFilters.searchQuery}". Try a different search term.`
                        : extendedFilters.category !== "all" || extendedFilters.priceRange !== 'all' || extendedFilters.availableOnly
                        ? "No services match your filters. Try adjusting your criteria."
                        : "Services are being added. Please check back soon."
                      }
                    </p>
                    {(extendedFilters.searchQuery || extendedFilters.category !== "all" || extendedFilters.priceRange !== 'all' || extendedFilters.availableOnly) && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setExtendedFilters({
                          category: 'all',
                          sortBy: undefined,
                          priceRange: 'all',
                          availableOnly: false,
                          searchQuery: '',
                        })}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </div>
        </div>

        {/* Booking Dialog */}
        <BookingDialog
          open={isBookingDialogOpen}
          onOpenChange={(open) => !open && closeBookingDialog()}
          service={selectedService}
          form={bookingForm}
          onFormChange={updateBookingForm}
          onSubmit={submitBooking}
          isSubmitting={isSubmitting}
          validationErrors={validationErrors}
        />
      </div>
    </>
  );
};

export default Services;
