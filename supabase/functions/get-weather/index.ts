import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    // SECURITY: Require API key to be configured - no hardcoded fallback
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Weather service not configured' }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Tiruvannamalai coordinates (fixed location)
    const lat = 12.2253;
    const lon = 79.0747;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenWeatherMap API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Weather service unavailable' }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();

    // Return only necessary data (no API key exposure)
    const weatherData = {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      visibility: Math.round(data.visibility / 1000),
      icon: data.weather[0].icon,
    };

    return new Response(
      JSON.stringify(weatherData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600' // Cache for 10 minutes
        }
      }
    );
  } catch (error) {
    console.error('Weather fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weather data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
