import { useState, useEffect } from 'react'
import Globe from 'react-globe.gl'
import { FaXTwitter, FaGithub } from 'react-icons/fa6'
import './App.css'

interface Point {
  lat: number;
  lng: number;
  size: number;
  color: string;
  height: number;
  count: number;
  location?: string;
}

function App() {
  const [points, setPoints] = useState<Point[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    document.title = 'Global Gmonads';
  }, []);

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

  const Leaderboard = () => {
    if (!showLeaderboard) return null;

    const sortedPoints = [...points].sort((a, b) => b.count - a.count);

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
            Gmonad Leaderboard
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
          {sortedPoints.map((point, index) => (
            <div key={`${point.lat}-${point.lng}`} style={{
              padding: '10px',
              backgroundColor: index === 0 ? 'rgba(131, 110, 249, 0.1)' : 'transparent',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(14, 16, 15, 0.1)'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#200052' }}>
                  {point.location || 'Unknown Location'}
                </div>
                <div style={{ fontSize: '14px', color: '#0E100F' }}>
                  {point.count} gmonad{point.count !== 1 ? 's' : ''}
                </div>
              </div>
              {index === 0 && (
                <span style={{ color: '#A0055D', fontSize: '20px' }}>👑</span>
              )}
            </div>
          ))}
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

        setPoints(prevPoints => {
          const existingPointIndex = prevPoints.findIndex(
            p => Math.round(p.lat * 1000) / 1000 === roundedLat && 
                Math.round(p.lng * 1000) / 1000 === roundedLng
          );

          if (existingPointIndex !== -1) {
            const updatedPoints = [...prevPoints];
            const existingPoint = updatedPoints[existingPointIndex];
            const newCount = existingPoint.count + 1;
            updatedPoints[existingPointIndex] = {
              ...existingPoint,
              count: newCount,
              height: calculateHeight(newCount),
              size: 0.2 + (Math.log(newCount + 1) * 0.1), // Adjust size with count too
              location: locationString
            };
            return updatedPoints;
          } else {
            return [...prevPoints, {
              lat: roundedLat,
              lng: roundedLng,
              size: 0.2, // Start with a smaller size
              color: '#836EF9',
              height: calculateHeight(1),
              count: 1,
              location: locationString
            }];
          }
        });
      }, (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please enable location services.')
      })
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#FBFAF9',
      position: 'relative',
      overflow: 'hidden',
    }}>
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
            color: '#200052',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center'
          }}>
            Global Gmonads
          </h1>
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
              color: '#0E100F',
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
              color: '#0E100F',
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
            color: '#0E100F',
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
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            backgroundImageUrl={null}
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
              if (point) {
                const p = point as Point;
                const tooltip = document.createElement('div');
                tooltip.className = 'globe-tooltip';
                tooltip.innerHTML = `
                  <div style="
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px;
                    border-radius: 4px;
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                  ">
                    <strong>${p.count} gmonad${p.count > 1 ? 's' : ''}</strong><br/>
                    ${p.location || 'Location unknown'}
                  </div>
                `;
                document.body.appendChild(tooltip);
                
                document.onmousemove = (e) => {
                  tooltip.style.left = (e.pageX + 10) + 'px';
                  tooltip.style.top = (e.pageY + 10) + 'px';
                };
              } else {
                const tooltip = document.querySelector('.globe-tooltip');
                if (tooltip) {
                  tooltip.remove();
                }
                document.onmousemove = null;
              }
            }}
          />
        </div>

        {/* Leaderboard Modal */}
        <Leaderboard />
      </div>
    </div>
  )
}

export default App
