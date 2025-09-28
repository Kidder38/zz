import React, { useEffect, useRef } from 'react';

const LocationMap = ({ location, width = '100%', height = '400px' }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!location?.gps_latitude || !location?.gps_longitude) {
      return;
    }

    // Vytvoření iframe s Google Maps nebo OpenStreetMap
    const createMapIframe = () => {
      const lat = location.gps_latitude;
      const lng = location.gps_longitude;
      const locationName = encodeURIComponent(location.location_name || 'Lokace');
      
      // Můžeme použít různé mapové služby
      // Google Maps (vyžaduje API klíč pro produkci)
      // const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}`;
      
      // OpenStreetMap (bezplatné)
      const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
      
      return (
        <iframe
          src={osmUrl}
          width="100%"
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      );
    };

    if (mapRef.current) {
      const iframe = createMapIframe();
      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(iframe);
    }
  }, [location, height]);

  if (!location?.gps_latitude || !location?.gps_longitude) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📍</div>
          <div className="text-sm">GPS souřadnice nejsou k dispozici</div>
          {location?.address && (
            <div className="text-xs mt-1 text-gray-400">{location.address}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info o lokaci */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">📍</span>
          <div className="flex-1">
            <div className="font-medium text-blue-900">{location.location_name}</div>
            <div className="text-sm text-blue-700">{location.address}</div>
          </div>
          <div className="text-xs text-blue-600">
            GPS: {location.gps_latitude}, {location.gps_longitude}
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div 
        ref={mapRef}
        className="rounded-lg overflow-hidden shadow-md"
        style={{ width, height }}
      >
        <div className="flex items-center justify-center bg-gray-100 h-full">
          <div className="text-gray-500">Načítání mapy...</div>
        </div>
      </div>

      {/* Rychlé odkazy */}
      <div className="flex space-x-2 text-sm">
        <a
          href={`https://www.google.com/maps?q=${location.gps_latitude},${location.gps_longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <span>🗺️</span>
          <span>Google Maps</span>
        </a>
        <a
          href={`https://mapy.cz/s/${location.gps_latitude}N${location.gps_longitude}E`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <span>🇨🇿</span>
          <span>Mapy.cz</span>
        </a>
        <a
          href={`https://www.openstreetmap.org/#map=15/${location.gps_latitude}/${location.gps_longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <span>🌍</span>
          <span>OpenStreetMap</span>
        </a>
      </div>
    </div>
  );
};

export default LocationMap;