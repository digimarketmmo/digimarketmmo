import React, { useContext } from 'react';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { AdType } from '../types.ts';

interface DynamicAdProps {
    locationId: string;
}

export const DynamicAd: React.FC<DynamicAdProps> = ({ locationId }) => {
    const context = useContext(AppContext) as AppContextType;

    if (!context) return null;

    const { ads } = context;
    const ad = ads.find(a => a.locationId === locationId && a.isActive);

    if (!ad) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-gray-600/50">
                <h3 className="text-base font-semibold text-gray-300">Vị trí Quảng cáo</h3>
                <p className="text-xs text-gray-400 mt-1">({locationId})</p>
            </div>
        );
    }

    if (ad.type === AdType.IMAGE) {
        return (
            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full group bg-gray-700">
                <img 
                    src={ad.content} 
                    alt={`Advertisement for ${ad.locationId}`} 
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" 
                />
            </a>
        );
    }
    
    if (ad.type === AdType.SCRIPT) {
        const iframeContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }</style>
            </head>
            <body>
                ${ad.content}
            </body>
            </html>
        `;
        return (
            <iframe
                srcDoc={iframeContent}
                title={`Advertisement for ${locationId}`}
                sandbox="allow-scripts allow-same-origin"
                scrolling="no"
                frameBorder="0"
                className="w-full h-full"
            />
        );
    }

    return null;
};
