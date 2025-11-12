import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { DigiMarketLogo } from './icons.tsx';

export const Footer: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const { contentPages } = context || {};

  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <DigiMarketLogo className="h-8 w-8 text-primary-500" />
              <span className="text-white text-xl font-bold">DigiMarket</span>
            </Link>
            <p className="text-gray-400 mt-4 text-sm">
              Sàn giao dịch tài sản số hàng đầu Việt Nam. An toàn, uy tín và tiện lợi.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Về DigiMarket</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/content/about-us" className="text-base text-gray-400 hover:text-white">Về chúng tôi</Link></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Tuyển dụng</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Hỗ trợ & Chính sách</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/support" className="text-base text-gray-400 hover:text-white">Trung tâm hỗ trợ</Link></li>
              {contentPages?.map(page => (
                 <li key={page.id}>
                    <Link to={`/content/${page.slug}`} className="text-base text-gray-400 hover:text-white capitalize">
                      {page.title}
                    </Link>
                  </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Kết nối</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Facebook</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Telegram</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Youtube</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} DigiMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
