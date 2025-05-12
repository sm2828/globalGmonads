import { useState, useEffect, useRef } from 'react'
import Globe, { GlobeMethods } from 'react-globe.gl'
import { FaXTwitter, FaGithub, FaUserSecret, FaGlobe } from 'react-icons/fa6'
import { addLocation, getLocations, Location as SupabaseLocation } from './lib/supabase'
import InfoModal from './components/InfoModal'
import './App.css'

interface Point {
  lat: number;
  lng: number;
  size: number;
  color: string;
  height: number;
  count: number;
  location?: string;
  created_at?: string;
}

function App() {
  const [points, setPoints] = useState<Point[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showAnonymousModal, setShowAnonymousModal] = useState(false)
  const [anonymousLocation, setAnonymousLocation] = useState('')
  const [globeStyle, setGlobeStyle] = useState<'dark' | 'clouds'>('dark')
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showInfoModal, setShowInfoModal] = useState(false)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)

  useEffect(() => {
    document.title = 'Global Gmonads'
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisited')
    if (!hasVisited) {
      setShowInfoModal(true)
      localStorage.setItem('hasVisited', 'true')
    }
    const loadPoints = async () => {
      try {
        console.log('Fetching points from Supabase');
        const locations = await getLocations();
        const points = locations.map((loc: SupabaseLocation) => ({
          lat: loc.latitude,
          lng: loc.longitude,
          size: 0.2 + (Math.log(loc.count + 1) * 0.1),
          color: '#836EF9',
          height: calculateHeight(loc.count),
          count: loc.count,
          location: loc.location_name,
          created_at: loc.created_at
        }));
        setPoints(points);
      } catch (error) {
        console.error('Error loading points:', error);
      }
    };
    loadPoints();
  }, []);

  useEffect(() => {
    if (!hoveredPoint) return;

    const handleMouseMove = (e: MouseEvent) => {
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredPoint]);

  const calculateHeight = (count: number) => {
    // Start truly flat (0.001) and grow logarithmically
    return 0.001 + (Math.log(count + 1) * 0.8);
  };

  const getLocationDetails = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      const state = data.principalSubdivision || '';
      const country = data.countryName || '';
      return `${state}${state && country ? ', ' : ''}${country}`;
    } catch (error) {
      console.error('Error fetching location details:', error);
      return 'Location unknown';
    }
  };

  const savePoints = async (newPoints: Point[]) => {
    try {
      for (const point of newPoints) {
        await addLocation(point.lat, point.lng, point.location);
      }
    } catch (error) {
      console.error('Error saving points:', error);
    }
  };

  const Leaderboard = () => {
    if (!showLeaderboard) return null;

    const sortedPoints = [...points].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(251, 250, 249, 0.95)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        maxHeight: '80vh',
        overflowY: 'auto',
        minWidth: '300px',
        border: '2px solid #200052'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            color: '#200052',
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Recent Gmonads
          </h2>
          <button
            onClick={() => setShowLeaderboard(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#A0055D'
            }}
          >
            ×
          </button>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {sortedPoints.map((point) => {
            const date = point.created_at ? new Date(point.created_at) : null;
            const formattedDate = date ? date.toLocaleDateString() : 'Unknown date';
            const formattedTime = date ? date.toLocaleTimeString() : '';
            
            return (
              <div 
                key={`${point.lat}-${point.lng}`} 
                onClick={() => {
                  setShowLeaderboard(false);
                  focusOnPoint(point.lat, point.lng);
                }}
                style={{
                  padding: '10px',
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  borderBottom: '1px solid rgba(14, 16, 15, 0.1)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(131, 110, 249, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#200052' }}>
                  {point.location || 'Unknown Location'}
                </div>
                <div style={{ fontSize: '14px', color: '#0E100F' }}>
                  {formattedDate}{formattedTime ? ` at ${formattedTime}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const addCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const roundedLat = Math.round(position.coords.latitude * 1000) / 1000;
        const roundedLng = Math.round(position.coords.longitude * 1000) / 1000;

        const locationString = await getLocationDetails(roundedLat, roundedLng);
        
        console.log('Current points:', points);
        const newPoints = [...points];
        const existingPointIndex = points.findIndex(
          p => Math.round(p.lat * 1000) / 1000 === roundedLat && 
              Math.round(p.lng * 1000) / 1000 === roundedLng
        );

        if (existingPointIndex !== -1) {
          const existingPoint = newPoints[existingPointIndex];
          const newCount = existingPoint.count + 1;
          newPoints[existingPointIndex] = {
            ...existingPoint,
            count: newCount,
            height: calculateHeight(newCount),
            size: 0.2 + (Math.log(newCount + 1) * 0.1),
            location: locationString
          };
        } else {
          newPoints.push({
            lat: roundedLat,
            lng: roundedLng,
            size: 0.2,
            color: '#836EF9',
            height: calculateHeight(1),
            count: 1,
            location: locationString
          });
        }

        console.log('Updating points to:', newPoints);
        setPoints(newPoints);
        await savePoints(newPoints);
      });
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  const handleAnonymousSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousLocation.trim()) return;

    try {
      // First try with OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(anonymousLocation)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        const roundedLat = Math.round(parseFloat(location.lat) * 1000) / 1000;
        const roundedLng = Math.round(parseFloat(location.lon) * 1000) / 1000;

        const newPoints = [...points];
        const existingPointIndex = points.findIndex(
          p => Math.round(p.lat * 1000) / 1000 === roundedLat && 
              Math.round(p.lng * 1000) / 1000 === roundedLng
        );

        if (existingPointIndex !== -1) {
          const existingPoint = newPoints[existingPointIndex];
          const newCount = existingPoint.count + 1;
          newPoints[existingPointIndex] = {
            ...existingPoint,
            count: newCount,
            height: calculateHeight(newCount),
            size: 0.2 + (Math.log(newCount + 1) * 0.1),
            location: anonymousLocation,
            created_at: new Date().toISOString()
          };
        } else {
          newPoints.push({
            lat: roundedLat,
            lng: roundedLng,
            size: 0.2,
            color: '#836EF9',
            height: calculateHeight(1),
            count: 1,
            location: anonymousLocation,
            created_at: new Date().toISOString()
          });
        }

        setPoints(newPoints);
        await savePoints(newPoints);
        setAnonymousLocation('');
        setShowAnonymousModal(false);
      } else {
        // If OpenStreetMap fails, try with BigDataCloud as fallback
        const fallbackResponse = await fetch(
          `https://api.bigdatacloud.net/data/geocode-client?localityLanguage=en&q=${encodeURIComponent(anonymousLocation)}`
        );
        const fallbackData = await fallbackResponse.json();

        if (fallbackData && fallbackData.latitude && fallbackData.longitude) {
          const roundedLat = Math.round(fallbackData.latitude * 1000) / 1000;
          const roundedLng = Math.round(fallbackData.longitude * 1000) / 1000;

          const newPoints = [...points];
          const existingPointIndex = points.findIndex(
            p => Math.round(p.lat * 1000) / 1000 === roundedLat && 
                Math.round(p.lng * 1000) / 1000 === roundedLng
          );

          if (existingPointIndex !== -1) {
            const existingPoint = newPoints[existingPointIndex];
            const newCount = existingPoint.count + 1;
            newPoints[existingPointIndex] = {
              ...existingPoint,
              count: newCount,
              height: calculateHeight(newCount),
              size: 0.2 + (Math.log(newCount + 1) * 0.1),
              location: anonymousLocation,
              created_at: new Date().toISOString()
            };
          } else {
            newPoints.push({
              lat: roundedLat,
              lng: roundedLng,
              size: 0.2,
              color: '#836EF9',
              height: calculateHeight(1),
              count: 1,
              location: anonymousLocation,
              created_at: new Date().toISOString()
            });
          }

          setPoints(newPoints);
          await savePoints(newPoints);
          setAnonymousLocation('');
          setShowAnonymousModal(false);
        } else {
          alert(`Could not find coordinates for "${anonymousLocation}". Please try a different format (e.g., "New York City, NY, USA" or "London, UK").`);
        }
      }
    } catch (error) {
      console.error('Error processing anonymous location:', error);
      alert('Error processing location. Please try again later.');
    }
  };

  const AnonymousModal = () => {
    if (!showAnonymousModal) return null;

    return (
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(251, 250, 249, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          minWidth: '300px',
          border: '2px solid #200052'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            color: '#200052',
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Anonymous Location
          </h2>
          <button
            onClick={() => setShowAnonymousModal(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#A0055D'
            }}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleAnonymousSubmit}>
          <input
            type="text"
            value={anonymousLocation}
            onChange={(e) => setAnonymousLocation(e.target.value)}
            placeholder="Enter city, state, or country"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '6px',
              border: '1px solid #200052',
              fontSize: '16px'
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowAnonymousModal(false);
              }
            }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#A0055D',
                color: '#FBFAF9',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              gmonad
            </button>
            <button
              type="button"
              onClick={() => setShowAnonymousModal(false)}
              style={{
                padding: '10px',
                backgroundColor: '#200052',
                color: '#FBFAF9',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const focusOnPoint = (lat: number, lng: number) => {
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat,
        lng,
        altitude: 2
      }, 1000); // 1000ms animation duration
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#FBFAF9',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
      {/* Container for all content */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Header content */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          width: 'fit-content'
        }}>
          <h1 style={{
            margin: 0,
            color: globeStyle === 'clouds' ? '#FFFFFF' : '#200052',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center'
          }}>
            Global Gmonads
          </h1>
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            <button 
              onClick={addCurrentLocation}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#A0055D',
                color: '#FBFAF9',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              gmonad
            </button>
            <button
              onClick={() => setShowAnonymousModal(true)}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#200052',
                color: '#FBFAF9',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaUserSecret /> Anonymous
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          zIndex: 1,
          display: 'flex',
          gap: '20px'
        }}>
          <a 
            href="https://x.com/monadbull" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: globeStyle === 'clouds' ? '#FFFFFF' : '#0E100F',
              fontSize: '24px',
              transition: 'color 0.2s ease'
            }}
          >
            <FaXTwitter />
          </a>
          <a 
            href="https://github.com/sm2828" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: globeStyle === 'clouds' ? '#FFFFFF' : '#0E100F',
              fontSize: '24px',
              transition: 'color 0.2s ease'
            }}
          >
            <FaGithub />
          </a>
        </div>

        {/* Counter with click handler */}
        <div 
          onClick={() => setShowLeaderboard(true)}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            color: globeStyle === 'clouds' ? '#FFFFFF' : '#0E100F',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            zIndex: 1,
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            backgroundColor: 'rgba(131, 110, 249, 0.1)'
          }}
        >
          {points.reduce((sum, point) => sum + point.count, 0)} gmonads tracked
        </div>

        {/* Globe container */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Globe
            ref={globeRef}
            globeImageUrl={globeStyle === 'dark' 
              ? "//unpkg.com/three-globe/example/img/earth-dark.jpg"
              : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            }
            backgroundImageUrl={globeStyle === 'clouds' 
              ? "//unpkg.com/three-globe/example/img/night-sky.png"
              : null
            }
            backgroundColor="#FBFAF9"
            pointsData={points}
            pointAltitude="height"
            pointRadius="size"
            pointColor="color"
            atmosphereColor="#200052"
            atmosphereAltitude={0.25}
            width={window.innerWidth}
            height={window.innerHeight}
            onPointHover={(point) => {
              setHoveredPoint(point as Point | null);
            }}
          />
          {hoveredPoint && (
            <div
              className="globe-tooltip"
              style={{
                position: 'fixed',
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y + 10,
                zIndex: 1000,
                pointerEvents: 'none',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '4px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                transform: 'translate(-50%, -100%)',
                marginTop: '-10px'
              }}
            >
              <strong>{hoveredPoint.count} gmonad{hoveredPoint.count > 1 ? 's' : ''}</strong><br/>
              {hoveredPoint.location || 'Location unknown'}
            </div>
          )}
        </div>

        {/* Globe Style Toggle */}
        <button
          onClick={() => setGlobeStyle(globeStyle === 'dark' ? 'clouds' : 'dark')}
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            padding: '10px',
            backgroundColor: '#200052',
            color: '#FBFAF9',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1
          }}
        >
          <FaGlobe />
          {globeStyle === 'dark' ? 'Normal' : 'Dark'}
        </button>

        {/* Add the Anonymous Modal */}
        <AnonymousModal />
        
        {/* Leaderboard Modal */}
        <Leaderboard />
      </div>
    </div>
  )
}

export default App

