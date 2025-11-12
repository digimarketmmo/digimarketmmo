import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { ClipboardList, CheckCircle, DollarSign } from '../components/icons.tsx';

// Define survey providers
const providers = [
    { name: 'BitLabs', id: 'bitlabs' },
    { name: 'CPX Research', id: 'cpx' },
    { name: 'TheoremReach', id: 'theoremreach' },
];

// Placeholder for API keys/IDs - in a real app, these would come from a secure config
const providerConfig = {
    bitlabs: { apiToken: 'c7a0551c-3e28-4171-a4a3-195f0393231c' }, // Example token
    cpx: { appId: '23188' },
    theoremreach: { apiKey: 'e57c66124501257d0843e33e449c450f' }, // Example key
};

const TabButton: React.FC<{
    providerId: string;
    name: string;
    activeProvider: string;
    onClick: (id: string) => void;
}> = ({ providerId, name, activeProvider, onClick }) => (
    <button
        onClick={() => onClick(providerId)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeProvider === providerId 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
    >
        {name}
    </button>
);

const SurveysPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [activeProvider, setActiveProvider] = useState(providers[0].id);
    const [isLoading, setIsLoading] = useState(true);
    const [surveyWallUrl, setSurveyWallUrl] = useState('');

    if (!context) {
        return <div>Đang tải...</div>;
    }

    const { currentUser } = context;

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    
    useEffect(() => {
        setIsLoading(true);

        const getUrlForProvider = (providerId: string): string => {
            switch (providerId) {
                case 'bitlabs':
                    return `https://web.bitlabs.ai?token=${providerConfig.bitlabs.apiToken}&uid=${currentUser.id}`;
                case 'cpx':
                    return `https://wall.cpx-research.com/index.php?username=${currentUser.id}&app_id=${providerConfig.cpx.appId}&email=${currentUser.email}&country_code=VN&style=x-eyJmb250X2NvbG9yIjoiI0ZGRkZGRiIsImJhY2tncm91bmRfY29sb3IiOiIjMTExODI3IiwidGV4dF9jb2xvciI6IiNEMUQ1REIiLCJzdXJ2ZXlfYnV0dG9uX2NvbG9yIjoiIzRGNDZFNSIgfQ==`;
                case 'theoremreach':
                    return `https://theoremreach.com/respond?api_key=${providerConfig.theoremreach.apiKey}&user_id=${currentUser.id}`;
                default:
                    return '';
            }
        };

        setSurveyWallUrl(getUrlForProvider(activeProvider));
    }, [activeProvider, currentUser.id, currentUser.email]);


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Providers */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 sticky top-24">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-primary-500/10 rounded-full">
                                <ClipboardList size={28} className="text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Khảo sát kiếm tiền</h1>
                                <p className="text-gray-400 text-sm">Chọn một nhà cung cấp và bắt đầu.</p>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Hoàn thành khảo sát từ các đối tác của chúng tôi để nhận thưởng trực tiếp vào tài khoản DigiMarket của bạn. Phần thưởng sẽ được ghi có sau khi nhà cung cấp xác nhận hoàn thành.
                        </p>
                        <div className="space-y-2 text-sm text-gray-300">
                             <p className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Nhiều khảo sát mới mỗi ngày</p>
                             <p className="flex items-center gap-2"><DollarSign size={16} className="text-yellow-400"/> Nhận thưởng ngay vào ví</p>
                        </div>
                         <hr className="my-6 border-gray-700" />
                         <h3 className="font-semibold text-white mb-3">Chọn nhà cung cấp:</h3>
                         <div className="flex flex-wrap gap-2">
                            {providers.map(p => <TabButton key={p.id} providerId={p.id} name={p.name} activeProvider={activeProvider} onClick={setActiveProvider} />)}
                         </div>
                    </div>
                </div>

                {/* Right Column: Survey Wall */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-1 md:p-2 relative min-h-[80vh] w-full border border-gray-700">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg z-10">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-primary-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="mt-4 text-gray-300">Đang tải tường khảo sát từ {providers.find(p=>p.id === activeProvider)?.name}...</p>
                                </div>
                            </div>
                        )}
                        <iframe
                            key={activeProvider} // Important: change key to force iframe reload on src change
                            src={surveyWallUrl}
                            title={`Tường khảo sát ${providers.find(p=>p.id === activeProvider)?.name}`}
                            onLoad={() => setIsLoading(false)}
                            className={`w-full h-[80vh] border-0 rounded-md transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            allow="encrypted-media"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveysPage;