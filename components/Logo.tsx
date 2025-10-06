import React from 'react';

interface LogoProps {
    className?: string;
}

const logoDataUri = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='50' fill='%23346BF1'/%3e%3ctext x='50' y='55' font-size='30' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif' font-weight='bold'%3eABM%3c/text%3e%3c/svg%3e";

export const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <img 
            src={logoDataUri}
            className={className}
            alt="ABM-UT Learning Assistant Logo"
        />
    );
};