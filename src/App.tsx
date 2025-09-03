import React, { useState } from 'react';
import { Database } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DataUpload from './components/DataUpload';
import OverviewDashboard from './components/OverviewDashboard';
import ClusteringView from './components/ClusteringView';
import ForecastingView from './components/ForecastingView';
import ModelingView from './components/ModelingView';
import ReportsView from './components/ReportsView';
import { CrimeRecord } from './types/crime';

function App() {
  const [crimes, setCrimes] = useState<CrimeRecord[]>([]);
  const [activeView, setActiveView] = useState('upload');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoad = async (data: CrimeRecord[]) => {
    setIsLoading(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCrimes(data);
    setActiveView('overview');
    setIsLoading(false);
  };

  const renderActiveView = () => {
    if (crimes.length === 0 && activeView !== 'upload') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <div className="bg-slate-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Database className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Data Available</h3>
            <p className="text-slate-500 mb-4">Please upload crime data to access this view</p>
            <button
              onClick={() => setActiveView('upload')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Data
            </button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'upload':
        return <DataUpload onDataLoad={handleDataLoad} isLoading={isLoading} />;
      case 'overview':
        return <OverviewDashboard crimes={crimes} />;
      case 'clustering':
        return <ClusteringView crimes={crimes} />;
      case 'forecasting':
        return <ForecastingView crimes={crimes} />;
      case 'modeling':
        return <ModelingView crimes={crimes} />;
      case 'reports':
        return <ReportsView crimes={crimes} />;
      default:
        return <DataUpload onDataLoad={handleDataLoad} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`
        flex-1 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;