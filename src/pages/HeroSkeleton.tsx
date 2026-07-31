
import { Skeleton } from "@/components/ui/skeleton";
import SiteHeader from "@/components/SiteHeader";

const HeroSkeleton = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SiteHeader />

            {/* Hero Section Skeleton */}
            <section className="relative min-h-screen flex flex-col">
                {/* Background Skeleton */}
                <div className="absolute inset-0 overflow-hidden">
                    <Skeleton className="w-full h-full rounded-none bg-muted/20" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[50vh] flex-grow pt-20 px-4">

                    {/* Weather Widget Skeleton */}
                    <div className="mb-8 w-full max-w-sm">
                        <Skeleton className="h-12 w-32 mx-auto rounded-full bg-muted/40 backdrop-blur-sm" />
                    </div>

                    {/* Main Title Area */}
                    <div className="text-center space-y-6 max-w-4xl w-full">
                        <Skeleton className="h-16 w-3/4 mx-auto rounded-lg bg-muted/40 backdrop-blur-sm" />
                        <Skeleton className="h-24 w-full mx-auto rounded-lg bg-muted/30 backdrop-blur-sm" />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-12 flex gap-4 justify-center w-full">
                        <Skeleton className="h-14 w-40 rounded-xl bg-muted/50 backdrop-blur-sm" />
                        <Skeleton className="h-14 w-40 rounded-xl bg-muted/50 backdrop-blur-sm" />
                    </div>

                    {/* Stats/Info Cards */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-2xl bg-muted/30 backdrop-blur-sm" />
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <Skeleton className="h-12 w-8 rounded-full bg-muted/50" />
                </div>
            </section>

            {/* Services Grid Skeleton */}
            <section className="px-4 py-16 bg-background">
                <div className="max-w-6xl mx-auto space-y-12">
                    <Skeleton className="h-10 w-64 mx-auto rounded-lg" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HeroSkeleton;
