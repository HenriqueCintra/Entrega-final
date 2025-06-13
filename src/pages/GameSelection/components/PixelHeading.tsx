import React from 'react';

interface PixelHeadingProps {
  text: string;
  className?: string;
}

const PixelHeading: React.FC<PixelHeadingProps> = ({ text, className = '' }) => {
  return (
    <h1 
      className={`
        text-3xl md:text-4xl text-white tracking-widest uppercase
        drop-shadow-xl
        ${className}
      `}
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
      {text.split('').map((char, index) => (
        <span 
          key={index} 
          className="inline-block transform transition-all duration-200 hover:scale-110 hover:text-yellow-300"
          style={{ padding: '0 0.05em' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
};

export default PixelHeading;