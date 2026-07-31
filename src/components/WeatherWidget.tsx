import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from "lucide-react";
import { Badge } from "./ui/badge";
import { logger } from "@/lib/logger";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
}

const WeatherWidget = ({ bg }: { bg?: boolean }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Tiruvannamalai coordinates
        const lat = 12.2253;
        const lon = 79.0747;
        const apiKey = "895284fb2d2c50a520ea537456963d9c"; // Free public API key for demo

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();

        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          visibility: Math.round(data.visibility / 1000), // Convert to km
          icon: data.weather[0].icon,
        });
        setLoading(false);
      } catch (error) {
        logger.error("Weather fetch error:", error);
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className="h-8 w-8 text-sky" />;
      case "clouds":
        return <Cloud className="h-8 w-8 text-sky" />;
      case "rain":
      case "drizzle":
        return <CloudRain className="h-8 w-8 text-sky" />;
      default:
        return <Cloud className="h-8 w-8 text-sky" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-card/60 backdrop-blur-md border-b border-border/30 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse flex items-center justify-between">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={`w-full ${bg && "bg-card/50 backdrop-blur-md"} border-none px-4 py-3 md:py-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Location & Main Weather */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              {getWeatherIcon(weather.condition)}
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  {weather.temp}°C
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {weather.condition}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Tiruvannamalai Girivalam
              </p>
            </div>
          </div>

          {/* Right: Weather Details (mobile optimized) */}
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm flex-shrink-0">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Wind className="h-3 w-3 md:h-4 md:w-4 text-sky" />
              <span className="hidden sm:inline">{weather.windSpeed}</span>
              <span className="sm:hidden">{weather.windSpeed}</span>
              <span className="hidden md:inline text-[10px]">km/h</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Droplets className="h-3 w-3 md:h-4 md:w-4 text-sky" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-muted-foreground">
              <Eye className="h-4 w-4 text-sky" />
              <span>{weather.visibility}km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
