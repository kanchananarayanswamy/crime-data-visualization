import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { CrimeRecord, CrimeCluster } from '../types/crime';
import { performCrimeClustering } from '../utils/mlModels';
import { Play, Settings, MapPin, Users, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface ClusteringViewProps {
  crimes: CrimeRecord[];
}

const ClusteringView: React.FC<ClusteringViewProps> = ({ crimes }) => {
  const [clusters, setClusters] = useState<CrimeCluster[]>([]);
  const [numClusters, setNumClusters] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runClustering = async () => {
    setIsAnalyzing(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = performCrimeClustering(crimes, numClusters);
    setClusters(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (crimes.length > 0) {
      runClustering();
    }
  }, [crimes]);

  const getClusterColor = (severity: string) => {
    switch (severity) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getClusterSize = (crimeCount: number) => {
    if (crimeCount > 50) return 25;
    if (crimeCount > 20) return 20;
    if (crimeCount > 10) return 15;
    return 10;
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Crime Hotspot Analysis</h2>
            <p className="text-slate-600">Identify high-crime areas using machine learning clustering</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-slate-600" />
              <label className="text-sm font-medium text-slate-700">Clusters:</label>
              <select
                value={numClusters}
                onChange={(e) => setNumClusters(parseInt(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-1 text-sm"
              >
                {[3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={runClustering}
              disabled={isAnalyzing || crimes.length === 0}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold
                transition-all duration-200
                ${isAnalyzing || crimes.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1'
                }
              `}
            >
              <Play className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Cluster Summary */}
        {clusters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">High Risk Clusters</p>
                  <p className="text-2xl font-bold text-red-600">
                    {clusters.filter(c => c.severity === 'High').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Clusters</p>
                  <p className="text-2xl font-bold text-orange-600">{clusters.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Crimes/Cluster</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(crimes.length / clusters.length)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Crime Hotspot Map</h3>
            </div>
            <div className="h-96">
              {crimes.length > 0 && (
                <MapContainer
                  center={[crimes[0].latitude, crimes[0].longitude]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Individual crimes */}
                  {crimes.map((crime) => (
                    <CircleMarker
                      key={crime.id}
                      center={[crime.latitude, crime.longitude]}
                      radius={3}
                      pathOptions={{ 
                        color: crime.severity === 'High' ? '#EF4444' : 
                               crime.severity === 'Medium' ? '#F59E0B' : '#10B981',
                        fillOpacity: 0.6 
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p><strong>{crime.category}</strong></p>
                          <p>{crime.date} at {crime.time}</p>
                          <p>Severity: {crime.severity}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                  
                  {/* Cluster centers */}
                  {clusters.map((cluster) => (
                    <CircleMarker
                      key={`cluster-${cluster.id}`}
                      center={[cluster.centerLat, cluster.centerLng]}
                      radius={getClusterSize(cluster.crimes.length)}
                      pathOptions={{
                        color: getClusterColor(cluster.severity),
                        fillOpacity: 0.3,
                        weight: 3
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p><strong>Cluster {cluster.id + 1}</strong></p>
                          <p>Crimes: {cluster.crimes.length}</p>
                          <p>Severity: {cluster.severity}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>

          {/* Cluster Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Cluster Details</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {clusters.map((cluster) => (
                  <div 
                    key={cluster.id}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800">
                        Cluster {cluster.id + 1}
                      </span>
                      <span 
                        className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${cluster.severity === 'High' ? 'bg-red-100 text-red-800' :
                            cluster.severity === 'Medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }
                        `}
                      >
                        {cluster.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {cluster.crimes.length} crimes
                    </p>
                    <p className="text-xs text-slate-500">
                      {cluster.centerLat.toFixed(4)}, {cluster.centerLng.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Map Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-700">High Severity Crime/Cluster</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-slate-700">Medium Severity Crime/Cluster</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-slate-700">Low Severity Crime/Cluster</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusteringView;