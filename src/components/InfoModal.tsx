import React from 'react';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#FBFAF9',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        maxWidth: '500px',
        width: '90%',
        border: '2px solid #200052',
      }}>
        <h2 style={{
          color: '#200052',
          margin: '0 0 20px 0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '24px',
        }}>
          Welcome to Global Gmonads
        </h2>
        <div style={{
          color: '#0E100F',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '25px',
        }}>
          <p>
            This application uses location data to place pins on the globe, showing where gmonads have been created around the world.
          </p>
          <p style={{ marginTop: '15px' }}>
            <strong>Your privacy is important:</strong>
          </p>
          <ul style={{
            listStyle: 'none',
            padding: '0',
            margin: '10px 0',
          }}>
            <li style={{ marginBottom: '10px' }}>• Location sharing is completely optional</li>
            <li style={{ marginBottom: '10px' }}>• You can place pins anonymously</li>
            <li>• Your data is only used to display pins on the globe</li>
          </ul>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            backgroundColor: '#A0055D',
            color: '#FBFAF9',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default InfoModal; 