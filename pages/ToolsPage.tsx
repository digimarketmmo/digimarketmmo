import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Facebook, Youtube, KeyRound, MailIcon, Check, Copy, RefreshCcw, Search, ExternalLink, Download, LineChart, Video, Instagram, Pinterest } from '../components/icons.tsx';
import { DynamicAd } from '../components/DynamicAd.tsx';

// --- Sub-components for each tool ---

const LiveChecker: React.FC<{ tool: 'Facebook' | 'TikTok' }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ status: 'live' | 'die' | 'error' | null, message: string }>({ status: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setResult({ status: null, message: '' });
    // Simulate API call
    setTimeout(() => {
      const isLive = Math.random() > 0.4;
      if (isLive) {
        setResult({ status: 'live', message: `Tài khoản ${tool} đang hoạt động.` });
      } else {
        setResult({ status: 'die', message: `Tài khoản ${tool} đã bị khóa hoặc không tồn tại.` });
      }
      setIsLoading(false);
    }, 1500);
  };

  const getResultClass = () => {
    switch (result.status) {
      case 'live': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'die': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'error': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'hidden';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Check Live {tool}</h2>
      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Nhập ID, username hoặc link profile ${tool}...`}
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-600">
          <Search size={16} /> {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra'}
        </button>
      </form>
      <div className={`mt-4 p-4 rounded-lg border text-center ${getResultClass()}`}>
        {result.message}
      </div>
    </div>
  );
};

const TwoFAGenerator: React.FC = () => {
    const [secret, setSecret] = useState('');
    const [otp, setOtp] = useState('------');
    const [timeLeft, setTimeLeft] = useState(0);
    const [error, setError] = useState('');

    // Base32 decoder
    const base32tohex = (base32: string): string => {
        const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let bits = "";
        let hex = "";
        const sanitizedBase32 = base32.replace(/=/g, '').toUpperCase();

        for (let i = 0; i < sanitizedBase32.length; i++) {
            const val = base32chars.indexOf(sanitizedBase32.charAt(i));
            if (val === -1) throw new Error("Invalid base32 character found");
            bits += val.toString(2).padStart(5, '0');
        }

        for (let i = 0; i + 8 <= bits.length; i += 8) {
            const chunk = bits.substr(i, 8);
            hex += parseInt(chunk, 2).toString(16).padStart(2, '0');
        }
        return hex;
    }

    const generateOtp = async (base32Secret: string) => {
        if (!base32Secret.trim()) {
            setOtp('------');
            setError('');
            return;
        }
        try {
            setError('');
            const secretHex = base32tohex(base32Secret);
            const secretBytes = new Uint8Array(secretHex.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16)));

            const counter = Math.floor(Date.now() / 1000 / 30);
            
            // The counter needs to be a 64-bit buffer (8 bytes) for HMAC-SHA1 as per RFC4226
            const counterBuffer = new ArrayBuffer(8);
            const counterView = new DataView(counterBuffer);
            // Javascript handles up to 53-bit integers precisely. This is safe.
            // We write a 64-bit integer, but the high 32 bits are 0.
            counterView.setUint32(4, counter, false); 

            const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
            const signature = await crypto.subtle.sign('HMAC', key, counterBuffer);

            const offset = new Uint8Array(signature)[19] & 0xf;
            const code = (new DataView(signature).getUint32(offset, false) & 0x7fffffff) % 1000000;

            setOtp(code.toString().padStart(6, '0'));
        } catch (e) {
            console.error(e);
            setError('Mã secret không hợp lệ. Vui lòng kiểm tra lại. Mã phải là Base32.');
            setOtp('------');
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const epoch = Math.round(new Date().getTime() / 1000.0);
            const newTimeLeft = 30 - (epoch % 30);
            setTimeLeft(newTimeLeft);
            if (newTimeLeft === 30) {
                generateOtp(secret);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [secret]);

    useEffect(() => {
        // Initial OTP generation
        generateOtp(secret);
    }, [secret]);

    const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSecret = e.target.value.replace(/\s/g, '');
        setSecret(newSecret);
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-4">Lấy mã 2FA (TOTP)</h2>
            <p className="text-gray-400 text-sm mb-4">Nhập mã secret Base32 của bạn để tạo mã xác thực 6 chữ số.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="secret" className="block text-sm font-medium text-gray-300 mb-1">Mã Secret (Base32)</label>
                    <input
                        id="secret"
                        type="text"
                        value={secret}
                        onChange={handleSecretChange}
                        placeholder="VD: JBSWY3DPEHPK3PXP"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white font-mono"
                    />
                </div>
                <div className="bg-gray-900/50 p-6 rounded-lg text-center">
                    <p className="text-5xl font-mono tracking-[0.2em] text-primary-400">{otp}</p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-4 overflow-hidden">
                        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(timeLeft / 30) * 100}%`, transition: timeLeft === 30 ? 'none' : 'width 1s linear' }}></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Mã mới sau {timeLeft} giây</p>
                </div>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            </div>
        </div>
    );
};

const TempMailGenerator: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const generateEmail = () => {
        const randomPart = Math.random().toString(36).substring(2, 12);
        setEmail(`${randomPart}@demomail.dev`);
        setIsCopied(false);
    };

    useEffect(() => {
        generateEmail();
    }, []);

    const handleCopy = () => {
        if (!email) return;
        navigator.clipboard.writeText(email).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-4">Tạo Mail Tạm thời</h2>
            <p className="text-gray-400 text-sm mb-4">Sử dụng email này để đăng ký dịch vụ. Chức năng nhận mail đang được phát triển.</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white font-mono text-center sm:text-left">
                    {email}
                </div>
                <button onClick={handleCopy} className={`flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold rounded-md transition-colors ${isCopied ? 'bg-green-600' : 'bg-primary-600 hover:bg-primary-700'}`}>
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    {isCopied ? 'Đã chép' : 'Sao chép'}
                </button>
                <button onClick={generateEmail} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">
                    <RefreshCcw size={16} /> Tạo mới
                </button>
            </div>
        </div>
    );
};

const VideoDownloader: React.FC = () => {
    const navigate = useNavigate();
    const [platform, setPlatform] = useState<'tiktok' | 'douyin' | 'facebook' | 'youtube' | 'instagram' | 'pinterest'>('tiktok');
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ title: string; thumbnail: string; links: { quality: string; url: string; }[] } | null>(null);
    const [error, setError] = useState('');

    const platforms = [
        { id: 'tiktok', name: 'TikTok', icon: <Youtube size={16} /> },
        { id: 'douyin', name: 'Douyin', icon: <Youtube size={16} /> },
        { id: 'facebook', name: 'Facebook', icon: <Facebook size={16} /> },
        { id: 'youtube', name: 'YouTube', icon: <Youtube size={16} /> },
        { id: 'instagram', name: 'Instagram', icon: <Instagram size={16} /> },
        { id: 'pinterest', name: 'Pinterest', icon: <Pinterest size={16} /> },
    ];

    const handleGetVideo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            setError('Vui lòng nhập URL video.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError('');

        // Simulate API call
        setTimeout(() => {
            if (url.includes('error')) {
                setError('Không thể tải thông tin video. Vui lòng kiểm tra lại URL.');
            } else {
                setResult({
                    title: `Đây là tiêu đề video mẫu cho ${platform}`,
                    thumbnail: 'https://source.unsplash.com/random/480x270/?video,thumbnail',
                    links: [
                        { quality: 'MP4 1080p', url: '#' },
                        { quality: 'MP4 720p', url: '#' },
                        { quality: 'MP3 128kbps', url: '#' },
                    ]
                });
            }
            setIsLoading(false);
        }, 2000);
    };
    
    const handleDownloadClick = (link: { quality: string; url: string; }) => {
        if (!result) return;
        // Navigate to a simulation page instead of trying to download a file
        navigate('/download-simulation', {
            state: {
                title: result.title,
                thumbnail: result.thumbnail,
                quality: link.quality,
            }
        });
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-4">Video Downloader</h2>
            
            <div className="flex flex-wrap gap-x-2 border-b border-gray-700 mb-4">
                {platforms.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => { setPlatform(p.id as any); setResult(null); setUrl(''); setError('') }}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 ${
                            platform === p.id 
                            ? 'border-primary-500 text-primary-400' 
                            : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        {p.icon} {p.name}
                    </button>
                ))}
            </div>

            <form onSubmit={handleGetVideo} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder={`Dán link video ${platform} vào đây...`}
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-600">
                    <Download size={16} /> {isLoading ? 'Đang xử lý...' : 'Tải xuống'}
                </button>
            </form>

            {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}

            {isLoading && (
                 <div className="text-center py-10">
                    <svg className="mx-auto h-8 w-8 text-primary-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-400">Đang lấy thông tin video...</p>
                </div>
            )}

            {result && (
                <div className="mt-6 bg-gray-700/50 p-4 rounded-lg flex flex-col sm:flex-row gap-4">
                    <img src={result.thumbnail} alt="Video thumbnail" className="w-full sm:w-48 h-auto rounded-md object-cover" />
                    <div className="flex-grow">
                        <h3 className="font-semibold text-white break-all">{result.title}</h3>
                        <div className="mt-4 space-y-2">
                            {result.links.map(link => (
                                <button 
                                    key={link.quality} 
                                    onClick={() => handleDownloadClick(link)}
                                    className="w-full flex items-center justify-between p-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors text-left"
                                >
                                    <span className="text-sm text-gray-200">{link.quality}</span>
                                    <Download size={16} className="text-primary-400"/>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Main ToolsPage Component ---

const ToolsPage: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'facebook' | 'tiktok' | '2fa' | 'mail' | 'downloader'>('facebook');

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash === 'facebook' || hash === 'tiktok' || hash === '2fa' || hash === 'mail' || hash === 'downloader') {
            setActiveTab(hash);
        } else {
            setActiveTab('facebook'); // Default tab
        }
    }, [location.hash]);

    const tabs = [
        { id: 'facebook', label: 'Check Live Facebook', icon: <Facebook size={18} /> },
        { id: 'tiktok', label: 'Check Live TikTok', icon: <Youtube size={18} /> },
        { id: '2fa', label: 'Lấy mã 2FA', icon: <KeyRound size={18} /> },
        { id: 'mail', label: 'Mail Tạm thời', icon: <MailIcon size={18} /> },
        { id: 'downloader', label: 'Video Downloader', icon: <Video size={18} /> },
    ];
    
    const relatedTools = [
        { icon: <Download size={20} />, name: "Video Downloader", description: "Tải video từ Facebook, TikTok không logo." },
        { icon: <LineChart size={20} />, name: "SEO Analyzer", description: "Phân tích SEO cơ bản cho website của bạn." },
        { icon: <KeyRound size={20} />, name: "Password Generator", description: "Tạo mật khẩu mạnh và an toàn." },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Bộ Công Cụ</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Nav & Ad */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-gray-800 rounded-lg p-2 space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="w-full overflow-hidden rounded-lg aspect-[1/1.5] bg-gray-800">
                            <DynamicAd locationId="tools-sidebar" />
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gray-800 rounded-lg p-6 min-h-[50vh] border border-gray-700/50">
                        {activeTab === 'facebook' && <LiveChecker tool="Facebook" />}
                        {activeTab === 'tiktok' && <LiveChecker tool="TikTok" />}
                        {activeTab === '2fa' && <TwoFAGenerator />}
                        {activeTab === 'mail' && <TempMailGenerator />}
                        {activeTab === 'downloader' && <VideoDownloader />}
                    </div>
                    
                    <div className="w-full overflow-hidden rounded-lg aspect-[4/1] bg-gray-800">
                        <DynamicAd locationId="tools-main-bottom" />
                    </div>

                    {/* Related Tools Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold text-white mb-4">Công cụ liên quan</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relatedTools.map((tool, index) => (
                                <a href="#" key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                                    <div className="text-primary-400">{tool.icon}</div>
                                    <div>
                                        <p className="font-semibold text-white">{tool.name}</p>
                                        <p className="text-xs text-gray-400">{tool.description}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Right Ad */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                         <div className="w-full overflow-hidden rounded-lg aspect-[1/1.5] bg-gray-800">
                            <DynamicAd locationId="tools-right-sidebar" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolsPage;