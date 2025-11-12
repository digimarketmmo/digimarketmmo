

import React from 'react';
import { ExternalLink } from './icons.tsx';

export const AdBanner: React.FC = () => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 my-8 text-center">
      <div className="border-2 border-dashed border-gray-500 p-8 rounded-md">
        <h3 className="text-lg font-semibold text-gray-300">Không gian quảng cáo</h3>
        <p className="text-sm text-gray-400 mt-1">
          Nơi hiển thị quảng cáo từ Google.
        </p>
        <a href="#" className="mt-4 inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-xs">
          Tìm hiểu thêm <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};