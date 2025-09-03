import React from 'react';
import { 
  BarChart3, 
  Map, 
  TrendingUp, 
  Shield, 
  Upload,
  Database,
  Activity,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  isCollapsed, 
  onToggle 
}) => {
  const menuItems = [
    { id: 'upload', label: 'Data Upload', icon: Upload },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'clustering', label: 'Crime Hotspots', icon: MapPin },
    { id: 'forecasting', label: 'Trend Analysis', icon: TrendingUp },
    { id: 'modeling', label: 'ML Models', icon: Activity },
    { id: 'reports', label: 'Reports', icon: Database }
  ];

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      bg-slate-900 text-white transition-all duration-300 ease-in-out
      flex flex-col border-r border-slate-700
    `}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">CrimeAnalyzer</h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        {!isCollapsed && (
          <div className="text-xs text-slate-400">
            Crime Analysis Dashboard v1.0
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;