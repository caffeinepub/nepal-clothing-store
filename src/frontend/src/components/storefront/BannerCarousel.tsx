import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Banner } from "../../backend.d";

// Demo banners shown when no backend banners are available
const DEMO_BANNERS = [
  {
    id: 1n,
    title: "New Festive Collection 2081",
    imageUrl: "/assets/generated/hero-banner-1.dim_1400x560.jpg",
    linkUrl: "/products",
    subtitle: "Celebrate with style — Traditional meets modern",
  },
  {
    id: 2n,
    title: "Men's Ethnic Wear",
    imageUrl: "/assets/generated/hero-banner-2.dim_1400x560.jpg",
    linkUrl: "/products?gender=Men",
    subtitle: "Daura Suruwal, Kurtas & more",
  },
  {
    id: 3n,
    title: "Women's Collection",
    imageUrl: "/assets/generated/hero-banner-3.dim_1400x560.jpg",
    linkUrl: "/products?gender=Women",
    subtitle: "Sarees, Salwar Kameez & contemporary fusion",
  },
];

interface BannerCarouselProps {
  banners?: Banner[];
  loading?: boolean;
}

export function BannerCarousel({
  banners = [],
  loading = false,
}: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  // Use backend banners if available, otherwise use demo
  const displayBanners =
    banners.length > 0
      ? banners.map((b) => ({
          id: b.id,
          title: b.title,
          imageUrl: b.imageRef.getDirectURL(),
          linkUrl: b.linkUrl,
          subtitle: "",
        }))
      : DEMO_BANNERS;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % displayBanners.length);
  }, [displayBanners.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + displayBanners.length) % displayBanners.length);
  };

  // Auto-rotate every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (loading) {
    return (
      <div className="relative w-full aspect-[16/6.4] bg-muted animate-pulse rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-secondary/50 to-muted animate-shimmer bg-[length:200%_100%]" />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg group">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {displayBanners.map((banner) => (
          <Link
            key={banner.id.toString()}
            to={banner.linkUrl as "/"}
            className="relative w-full shrink-0 aspect-[16/6.4] overflow-hidden block"
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent" />

            {/* Text */}
            <div className="absolute inset-0 flex items-center px-8 md:px-16">
              <div className="max-w-lg">
                {banner.subtitle && (
                  <p className="text-primary-foreground/80 text-sm md:text-base mb-2 font-medium uppercase tracking-widest">
                    {banner.subtitle}
                  </p>
                )}
                <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground leading-tight mb-4">
                  {banner.title}
                </h1>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation arrows */}
      {displayBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:scale-110 shadow-md"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:scale-110 shadow-md"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </>
      )}

      {/* Dots */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {displayBanners.map((banner, i) => (
            <button
              type="button"
              key={banner.id.toString()}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "w-6 h-2 bg-primary-foreground"
                  : "w-2 h-2 bg-primary-foreground/50 hover:bg-primary-foreground/80",
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
