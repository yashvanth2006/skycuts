import React from 'react';

const GlobalLoader = ({ fullScreen = false }) => {
  return (
    <div 
      className={fullScreen ? "global-loader" : ""}
      style={!fullScreen ? {
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flex: 1, 
        width: '100%', 
        position: 'relative',
        minHeight: '60vh'
      } : {}}
    >
      {!fullScreen && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 45%, rgba(185, 28, 28, 0.08), transparent 45%)',
          pointerEvents: 'none'
        }} />
      )}
      <div className="pan-loader" style={{ position: 'relative', zIndex: 2 }}>
      </div>
    </div>
  );
};

export default GlobalLoader;
