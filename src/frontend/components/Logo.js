import React from 'react';

const Logo = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: { width: '120px', height: '40px' },
    medium: { width: '200px', height: '67px' },
    large: { width: '300px', height: '100px' },
    xlarge: { width: '400px', height: '133px' }
  };

  const logoStyle = {
    display: 'inline-block',
    ...sizes[size],
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 133\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad1\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23FFA500;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23FF7F00;stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ctext x=\'20\' y=\'80\' font-family=\'Arial, sans-serif\' font-size=\'48\' font-weight=\'bold\' fill=\'%23333\'%3ERDMaster%3C/text%3E%3Ctext x=\'250\' y=\'80\' font-family=\'Arial, sans-serif\' font-size=\'48\' font-weight=\'bold\' fill=\'url(%23grad1)\' transform=\'skewX(-15)\'%3EX%3C/text%3E%3C/svg%3E")',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  };

  return (
    <div 
      className={`rdmasterx-logo ${className}`}
      style={logoStyle}
      title="RDMasterX - Professional Remote Connection Manager"
    />
  );
};

export default Logo;
