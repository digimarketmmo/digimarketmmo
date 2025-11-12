import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from '../components/icons.tsx';

const DownloadSimulationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);

    const state = location.state as { title: string; thumbnail: string; quality: string };

    useEffect(() => {
        if (!state) return; // Guard against direct navigation

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 20;
                if (next >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return next;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [state]);

    if (!state) {
        // If someone navigates here directly, send them to the tools page.
        return <Navigate to="/tools" replace />;
    }

    const { title, thumbnail, quality } = state;

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Đang tải xuống... (Mô phỏng)</h1>
            <p className="text-gray-400 mb-8">{title} - {quality}</p>

            <div className="bg-gray-800 p-6 rounded-lg">
                {progress < 100 ? (
                    <>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div
                                className="bg-primary-600 h-4 rounded-full transition-all duration-300 ease-linear"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="mt-4 text-white font-mono">{progress.toFixed(0)}%</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <img src={thumbnail} alt={title} className="w-full max-w-sm rounded-lg shadow-lg mb-6"/>
                        <p className="text-xl font-bold text-green-400 mb-4">Tải xuống hoàn tất! (Mô phỏng)</p>
                        <button
                            onClick={() => navigate(-1)} // Go back to the previous page
                            className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <ArrowLeft size={16} /> Quay lại
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadSimulationPage;
