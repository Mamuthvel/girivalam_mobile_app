import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
    Calendar,
    Moon,
    Users,
    Clock,
    MapPin,
    ArrowRight,
    AlertCircle,
} from "lucide-react";

const PournamiDates = () => {
    useEffect(() => {
        // Add Article Schema
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Pournami Girivalam Dates 2025-2026 | Full Moon Calendar",
            description:
                "Complete list of Pournami Girivalam dates for 2025-2026. Plan your sacred circumambulation during full moon at Tiruvannamalai.",
            author: {
                "@type": "Organization",
                name: "MyGirivalam.in",
            },
            publisher: {
                "@type": "Organization",
                name: "MyGirivalam.in",
                logo: {
                    "@type": "ImageObject",
                    url: "https://mygirivalam.in/logo.svg",
                },
            },
            datePublished: "2025-01-14",
            dateModified: "2026-06-13",
            mainEntityOfPage: {
                "@type": "WebPage",
                "@id": "https://mygirivalam.in/blog/pournami-dates-2025-2026",
            },
        });
        document.head.appendChild(script);

        // Add Breadcrumb Schema
        const breadcrumbScript = document.createElement("script");
        breadcrumbScript.type = "application/ld+json";
        breadcrumbScript.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://mygirivalam.in/"
            }, {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://mygirivalam.in/blog"
            }, {
                "@type": "ListItem",
                "position": 3,
                "name": "Pournami Dates 2025-2026",
                "item": "https://mygirivalam.in/blog/pournami-dates-2025-2026"
            }]
        });
        document.head.appendChild(breadcrumbScript);

        // Event schema for each upcoming 2026 Pournami Girivalam
        const upcomingEvents = [
            { name: "Pournami Girivalam — June 2026",   startDate: "2026-06-29T18:00", endDate: "2026-06-30T06:00" },
            { name: "Pournami Girivalam — July 2026",   startDate: "2026-07-29T18:00", endDate: "2026-07-30T06:00" },
            { name: "Pournami Girivalam — August 2026", startDate: "2026-08-27T18:00", endDate: "2026-08-28T06:00" },
            { name: "Pournami Girivalam — September 2026", startDate: "2026-09-26T18:00", endDate: "2026-09-27T06:00" },
            { name: "Pournami Girivalam — October 2026", startDate: "2026-10-25T18:00", endDate: "2026-10-26T06:00" },
            { name: "Pournami Girivalam — November 2026", startDate: "2026-11-24T18:00", endDate: "2026-11-25T06:00" },
            { name: "Pournami Girivalam — December 2026", startDate: "2026-12-23T18:00", endDate: "2026-12-24T06:00" },
        ];
        const eventScripts = upcomingEvents.map((ev) => {
            const s = document.createElement("script");
            s.type = "application/ld+json";
            s.text = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                name: ev.name,
                startDate: ev.startDate,
                endDate: ev.endDate,
                eventStatus: "https://schema.org/EventScheduled",
                eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                isAccessibleForFree: true,
                location: {
                    "@type": "Place",
                    name: "Arunachala Girivalam Path",
                    address: {
                        "@type": "PostalAddress",
                        addressLocality: "Tiruvannamalai",
                        addressRegion: "Tamil Nadu",
                        postalCode: "606601",
                        addressCountry: "IN",
                    },
                },
                description: "Sacred full moon Girivalam circumambulation of the 14km Arunachala Hill path in Tiruvannamalai. Millions of pilgrims walk barefoot during Pournami night.",
                organizer: {
                    "@type": "Organization",
                    name: "MyGirivalam.in",
                    url: "https://mygirivalam.in",
                },
                url: "https://mygirivalam.in/blog/pournami-dates-2025-2026",
            });
            document.head.appendChild(s);
            return s;
        });

        return () => {
            document.head.removeChild(script);
            document.head.removeChild(breadcrumbScript);
            eventScripts.forEach((s) => document.head.removeChild(s));
        };
    }, []);

    const pournamiDates2025 = [
        {
            month: "January",
            date: "Jan 13, 2025",
            name: "Pausha Purnima",
            crowd: "High",
        },
        {
            month: "February",
            date: "Feb 12, 2025",
            name: "Magha Purnima",
            crowd: "Very High",
        },
        {
            month: "March",
            date: "Mar 14, 2025",
            name: "Holi Purnima",
            crowd: "Very High",
        },
        {
            month: "April",
            date: "Apr 13, 2025",
            name: "Chaitra Purnima",
            crowd: "High",
        },
        {
            month: "May",
            date: "May 12, 2025",
            name: "Buddha Purnima",
            crowd: "Very High",
        },
        { month: "June", date: "Jun 11, 2025", name: "Vat Purnima", crowd: "Medium" },
        {
            month: "July",
            date: "Jul 10, 2025",
            name: "Guru Purnima",
            crowd: "Very High",
        },
        {
            month: "August",
            date: "Aug 9, 2025",
            name: "Shravana Purnima",
            crowd: "High",
        },
        {
            month: "September",
            date: "Sep 7, 2025",
            name: "Bhadrapada Purnima",
            crowd: "Medium",
        },
        {
            month: "October",
            date: "Oct 6, 2025",
            name: "Sharad Purnima",
            crowd: "High",
        },
        {
            month: "November",
            date: "Nov 5, 2025",
            name: "Kartik Purnima",
            crowd: "Very High",
        },
        {
            month: "December",
            date: "Dec 4, 2025",
            name: "Margashirsha Purnima",
            crowd: "High",
        },
    ];

    const pournamiDates2026 = [
        {
            month: "January",
            date: "Jan 3, 2026",
            name: "Pausha Purnima",
            crowd: "High",
        },
        {
            month: "February",
            date: "Feb 1, 2026",
            name: "Magha Purnima",
            crowd: "Very High",
        },
        {
            month: "March",
            date: "Mar 3, 2026",
            name: "Phalguna Purnima",
            crowd: "Very High",
        },
        {
            month: "April",
            date: "Apr 1, 2026",
            name: "Chaitra Purnima",
            crowd: "High",
        },
        {
            month: "May",
            date: "May 1, 2026",
            name: "Vaishakha Purnima",
            crowd: "Very High",
        },
        {
            month: "May",
            date: "May 30, 2026",
            name: "Jyeshtha Purnima (Adhika)",
            crowd: "High",
        },
        {
            month: "June",
            date: "Jun 29, 2026",
            name: "Jyeshtha Purnima",
            crowd: "Medium",
        },
        {
            month: "July",
            date: "Jul 29, 2026",
            name: "Ashadha Purnima",
            crowd: "Very High",
        },
        {
            month: "August",
            date: "Aug 27, 2026",
            name: "Shravana Purnima",
            crowd: "High",
        },
        {
            month: "September",
            date: "Sep 26, 2026",
            name: "Bhadrapada Purnima",
            crowd: "Medium",
        },
        {
            month: "October",
            date: "Oct 25, 2026",
            name: "Ashwin Purnima",
            crowd: "High",
        },
        {
            month: "November",
            date: "Nov 24, 2026",
            name: "Kartik Purnima",
            crowd: "Very High",
        },
        {
            month: "December",
            date: "Dec 23, 2026",
            name: "Margashirsha Purnima",
            crowd: "High",
        },
    ];

    const getCrowdColor = (crowd: string) => {
        switch (crowd) {
            case "Very High":
                return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
            case "High":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
            default:
                return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Girivalam Dates 2026 — Full Pournami Calendar | MyGirivalam.in</title>
                <meta name="description" content="Girivalam dates 2026: every Pournami (full moon) date for Tiruvannamalai, with crowd levels and prep tips. Plus a live map and GPS tracker for your walk." />
                <link rel="canonical" href="https://mygirivalam.in/blog/pournami-dates-2025-2026" />
            </Helmet>
            <SiteHeader />

            {/* Hero Section */}
            <div className="relative pt-24 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
                        <Moon className="h-3 w-3 mr-1" />
                        Full Moon Calendar
                    </Badge>
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-foreground">
                        Pournami Girivalam Dates 2025-2026
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                        Complete calendar of Pournami (Full Moon) Girivalam dates for 2025-2026. Plan your sacred 14km circumambulation at Tiruvannamalai Arunachalam temple.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* What is Pournami Girivalam */}
                <section className="mb-16">
                    <SpiritualCard className="p-8">
                        <h2 className="font-playfair text-3xl font-bold mb-4">
                            What is Pournami Girivalam?
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                            Pournami Girivalam is the sacred 14km circumambulation of Arunachala Hill in Tiruvannamalai performed on full moon nights (Pournami). This auspicious practice attracts lakhs of devotees monthly who walk barefoot around the sacred hill.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            The full moon day holds special spiritual significance as it is believed that Lord Shiva appeared as a column of fire (Agni Lingam) on this day. Devotees perform Girivalam on Pournami to receive divine blessings and spiritual merit.
                        </p>
                    </SpiritualCard>
                </section>

                {/* 2025 Dates */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="font-playfair text-3xl font-bold">
                            Pournami Dates 2025
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pournamiDates2025.map((item, index) => (
                            <SpiritualCard key={index} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{item.month}</p>
                                        <p className="font-semibold text-lg">{item.date}</p>
                                    </div>
                                    <Moon className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-sm font-medium text-foreground/80 mb-3">
                                    {item.name}
                                </p>
                                <Badge className={getCrowdColor(item.crowd)}>
                                    <Users className="h-3 w-3 mr-1" />
                                    {item.crowd} Crowd
                                </Badge>
                            </SpiritualCard>
                        ))}
                    </div>
                </section>

                {/* 2026 Dates */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="font-playfair text-3xl font-bold">
                            Pournami Dates 2026
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pournamiDates2026.map((item, index) => (
                            <SpiritualCard key={index} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{item.month}</p>
                                        <p className="font-semibold text-lg">{item.date}</p>
                                    </div>
                                    <Moon className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-sm font-medium text-foreground/80 mb-3">
                                    {item.name}
                                </p>
                                <Badge className={getCrowdColor(item.crowd)}>
                                    <Users className="h-3 w-3 mr-1" />
                                    {item.crowd} Crowd
                                </Badge>
                            </SpiritualCard>
                        ))}
                    </div>
                </section>

                {/* Best Time to Start */}
                <section className="mb-16">
                    <SpiritualCard className="p-8 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 border-sky-200 dark:border-sky-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                                <Clock className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h2 className="font-playfair text-3xl font-bold">
                                Best Time to Start Pournami Girivalam
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Ideal Start</p>
                                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                                    6:00 PM - 8:00 PM
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Moderate crowd, pleasant weather
                                </p>
                            </div>

                            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Avoid</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    10:00 PM - 2:00 AM
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Peak crowd hours
                                </p>
                            </div>

                            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Less Crowded</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    3:00 AM - 6:00 AM
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Peaceful, spiritual atmosphere
                                </p>
                            </div>
                        </div>
                    </SpiritualCard>
                </section>

                {/* Tips for Pournami Girivalam */}
                <section className="mb-16">
                    <SpiritualCard className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="font-playfair text-3xl font-bold">
                                Essential Tips for Pournami Girivalam
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Book accommodation 2-3 days in advance",
                                "Carry water bottle and light snacks",
                                "Wear comfortable footwear (barefoot is traditional)",
                                "Start early to avoid peak crowds",
                                "Use our Girivalam Map for navigation",
                                "Carry minimal belongings in a small bag",
                                "Respect temple timings and customs",
                                "Stay hydrated throughout the journey",
                            ].map((tip, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-white/50 dark:bg-background/50 rounded-lg"
                                >
                                    <ArrowRight className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-foreground/90">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </SpiritualCard>
                </section>

                {/* CTA Section */}
                <section className="text-center py-12 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl">
                    <h3 className="font-playfair text-3xl font-bold mb-3">
                        Plan Your Girivalam Journey
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Use our interactive map and book essential services for a smooth pilgrimage
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/girivalam-map">
                            <Button size="lg" className="bg-primary hover:bg-primary/90">
                                <MapPin className="h-4 w-4 mr-2" />
                                View Route Map
                            </Button>
                        </Link>
                        <Link to="/girivalam-services">
                            <Button size="lg" variant="outline">
                                Book Services
                            </Button>
                        </Link>
                        <Link to="/girivalam-guide">
                            <Button size="lg" variant="outline">
                                Complete Guide
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PournamiDates;
