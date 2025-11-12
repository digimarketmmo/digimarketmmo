import React from 'react';
import {
  LucideProps,
  MessageSquare,
  Bell,
  LayoutDashboard,
  User,
  ListOrdered,
  Wallet,
  Menu,
  X,
  ExternalLink,
  Star,
  Search,
  Briefcase,
  Trash2,
  Lock,
  Unlock,
  Crown,
  PlusCircle,
  Store,
  Users,
  Shield,
  Megaphone,
  Settings,
  Shapes,
  FileText,
  CheckCircle,
  Landmark,
  History,
  ClipboardList,
  Package,
  Download,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Send,
  Eye,
  ShieldCheck,
  DollarSign,
  Copy,
  Mail,
  Paintbrush,
  Video,
  Code2,
  BookOpen,
  Sparkles,
  Facebook,
  Youtube,
  Search as SearchIcon, // Renamed to avoid conflict
  MessageCircle, // FIX: Removed alias and imported directly
  FilePenLine,
  Music,
  BrainCircuit,
  LineChart,
  Gamepad2,
  ToggleLeft,
  ToggleRight,
  QrCode,
  Upload,
  ArrowLeft,
  Check,
  XCircle,
  ShoppingCart,
  Edit,
  TrendingUp,
  Clock,
  Heart,
  RefreshCcw,
  Gem,
  ArrowRight,
  Play,
  Pause,
  KeyRound,
  Image,
  Instagram,
  LifeBuoy,
  ChevronRight,
  ImagePlus,
  // FIX: Import the Calendar icon.
  Calendar,
} from 'lucide-react';

// Re-exporting for clarity and to avoid naming conflicts
export {
    MessageSquare, Bell, LayoutDashboard, User, ListOrdered, Wallet, Menu, X, ExternalLink, Star, Search, Briefcase, Trash2, Lock, Unlock, Crown, PlusCircle, Store, Users, Shield, Megaphone, Settings, Shapes, FileText, CheckCircle, Landmark, History, ClipboardList, Package, Download, ChevronDown, ArrowUp, ArrowDown, Send, Eye, ShieldCheck, DollarSign, Copy, Mail as MailIcon, Paintbrush, Video, Code2, BookOpen, Sparkles, Facebook, Youtube, 
    MessageCircle, // FIX: Exported directly
    FilePenLine, Music, BrainCircuit, LineChart, Gamepad2, ToggleLeft, ToggleRight, QrCode, Upload, ArrowLeft, Check, XCircle,
    ShoppingCart, Edit, TrendingUp, Clock, Heart, RefreshCcw, Gem, ArrowRight,
    Play, Pause,
    KeyRound,
    Image,
    Instagram,
    LifeBuoy,
    ChevronRight,
    ImagePlus,
    // FIX: Export the Calendar icon.
    Calendar,
};

export const DigiMarketLogo: React.FC<LucideProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
  </svg>
);

export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="m24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.612-3.874-11.08-9.042l-6.573 4.818A20 20 0 0 0 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.426 44 30.638 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

// FIX: Add a custom Pinterest icon component since it's not available in the lucide-react CDN version.
export const Pinterest: React.FC<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        strokeWidth="0"
        {...props}
    >
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.1 2.5 7.6 5.9 8.9-.1-1-.2-2.5.1-3.4.3-1 .9-2.2 1-2.5s.2-.5 0-.7c-.2-.4-.6-1.1-.6-2.2 0-1.8 1.2-3.2 2.7-3.2 1.3 0 1.9.9 1.9 2.1 0 1.3-.8 3.2-1.3 4.9-.4 1.3 1 2.4 2.3 2.4 2.8 0 4.9-2.9 4.9-6.3 0-3.3-2.4-5.7-5.9-5.7-3.9 0-6.1 2.8-6.1 5.6 0 .9.3 1.8.7 2.3.1.1.1.2 0 .3l-.2 1c0 .1-.1.2-.2.1-1.1-.5-1.8-1.9-1.8-3.4 0-2.6 2-5 5.2-5 3.1 0 5.4 2.2 5.4 5.1 0 3.2-1.9 5.5-4.5 5.5-1.4 0-2.6-1.1-2.2-2.5.4-1.7 1.2-3.4 1.2-4.6 0-1.1-.6-2-1.7-2-1.4 0-2.6 1.4-2.6 3.1 0 .9.4 1.6.4 1.6S7 20 6.8 20.8c-.3 1.2-1.2 2.5-1.8 3.1C6.2 22 7.1 22 8 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
);


// Dynamic Icon component
const iconMap: { [key: string]: React.ComponentType<LucideProps> } = {
  MessageSquare, Bell, LayoutDashboard, User, ListOrdered, Wallet, Menu, X, ExternalLink, Star, Search, Briefcase, Trash2, Lock, Unlock, Crown, PlusCircle, Store, Users, Shield, Megaphone, Settings, Shapes, FileText, CheckCircle, Landmark, History, ClipboardList, Package, Download, ChevronDown, ArrowUp, ArrowDown, Send, Eye, ShieldCheck, DollarSign, Copy, MailIcon: Mail, Paintbrush, Video, Code2, BookOpen, Sparkles, Facebook, Youtube, 
  MessageCircle, // FIX: Added to map correctly
  FilePenLine, Music, BrainCircuit, LineChart, Gamepad2, Upload, ArrowLeft, Heart, RefreshCcw, Gem, ArrowRight, KeyRound, Image,
  Instagram, Pinterest, LifeBuoy, ChevronRight, ImagePlus,
  // FIX: Add Calendar to the icon map for dynamic usage.
  Calendar,
};

export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) return <Star className={className} />; // Default icon
  return <IconComponent className={className} />;
};

export const availableIcons = Object.keys(iconMap);