
import React from 'react';
import { Home, TrendingUp, MessageSquare, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BottomNavProps {
  active: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const { setCurrentView, logout, t } = useApp();

  const navItems = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'invest', icon: TrendingUp, label: t('invest') },
    { id: 'comment', icon: MessageSquare, label: t('comment') },
    { id: 'logout', icon: LogOut, label: t('logout') }
  ];

  const handleNavClick = (id: string) => {
    if (id === 'logout') {
      logout();
    } else {
      setCurrentView(id);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-10">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        {navItems.map(item => (
          <button key={item.id} onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center justify-center h-full w-full gap-1 transition-colors duration-200 ${active === item.id ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}>
            <item.icon size={24} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
