import React from 'react';
import { Activity } from 'lucide-react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  text?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, showText = true, textColor = 'inherit', text = 'Solara Medical' }) => {
  const iconSize = size + 10;
  const textSize = (size * 0.45) + 3;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.3 }}>
      <div style={{ 
        width: iconSize, 
        height: iconSize, 
        background: '#130f40', 
        borderRadius: iconSize * 0.3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(19, 15, 64, 0.2)'
      }}>
        <Activity size={iconSize * 0.6} color="#33d9b2" strokeWidth={2.5} />
      </div>
      {showText && (
        <span style={{ 
          fontSize: `${textSize}px`, 
          fontWeight: 500, 
          color: textColor, 
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Logo;
