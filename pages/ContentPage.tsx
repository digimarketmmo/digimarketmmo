import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';

const ContentPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const context = useContext(AppContext) as AppContextType;
    
    if (!context) return null;

    const page = slug ? context.contentPages.find(p => p.slug === slug) : null;

    if (!page) {
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-3xl font-bold text-white mb-4">404 - Không tìm thấy trang</h1>
                <p className="text-gray-300">Trang bạn đang tìm kiếm không tồn tại.</p>
                <Link to="/" className="mt-4 inline-block bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors">
                    Về trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 md:p-12 prose prose-invert prose-lg max-w-4xl mx-auto">
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
        </div>
    );
};

export default ContentPage;
