
import React from 'react';
import { Home, TrendingUp, Menu, Users, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BottomNavProps {
  active: 'home' | 'invest' | 'menu' | 'club' | 'profile';
}

const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const { setCurrentView } = useApp();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'invest', icon: TrendingUp, label: 'Invest' },
    { id: 'menu', icon: Menu, label: 'Menu' },
    { id: 'club', icon: Users, label: 'Club' },
    { id: 'profile', icon: User, label: 'Me' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-10">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setCurrentView(item.id)}
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
