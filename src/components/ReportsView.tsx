import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { CrimeRecord } from '../types/crime';
import { 
  processCategoryData, 
  processHourlyData, 
  processTimeSeriesData 
} from '../utils/dataProcessing';
import { performCrimeClustering } from '../utils/mlModels';
import { 
  Download, 
  FileText, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface ReportsViewProps {
  crimes: CrimeRecord[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ crimes }) => {
  const [selectedReport, setSelectedReport] = useState('summary');
  const [dateRange, setDateRange] = useState('all');

  // Filter crimes based on date range
  const filteredCrimes = crimes.filter(crime => {
    if (dateRange === 'all') return true;
    
    const crimeDate = new Date(crime.date);
    const now = new Date();
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return crimeDate >= cutoffDate;
  });

  const categoryData = processCategoryData(filteredCrimes);
  const hourlyData = processHourlyData(filteredCrimes);
  const timeSeriesData = processTimeSeriesData(filteredCrimes);
  const clusters = performCrimeClustering(filteredCrimes, 5);

  // District analysis
  const districtData = filteredCrimes.reduce((acc, crime) => {
    if (crime.district) {
      acc[crime.district] = (acc[crime.district] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const districtChartData = Object.entries(districtData)
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);

  // Severity analysis
  const severityData = filteredCrimes.reduce((acc, crime) => {
    acc[crime.severity || 'Unknown'] = (acc[crime.severity || 'Unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityChartData = Object.entries(severityData)
    .map(([severity, count]) => ({ severity, count }));

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4'];

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: dateRange === 'all' ? 'All time' : `Last ${dateRange} days`,
      totalCrimes: filteredCrimes.length,
      categoryBreakdown: categoryData,
      districtBreakdown: districtChartData,
      severityBreakdown: severityChartData,
      clusters: clusters.length,
      timeSeriesSummary: {
        dailyAverage: Math.round(filteredCrimes.length / timeSeriesData.length),
        peakDay: timeSeriesData.reduce((max, day) => day.count > max.count ? day : max, timeSeriesData[0])
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crime-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reportTypes = [
    { id: 'summary', name: 'Executive Summary', icon: FileText },
    { id: 'temporal', name: 'Temporal Analysis', icon: Calendar },
    { id: 'spatial', name: 'Spatial Analysis', icon: MapPin },
    { id: 'trends', name: 'Trend Analysis', icon: TrendingUp }
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Crime Analysis Reports</h2>
            <p className="text-slate-600">Comprehensive reporting and data export capabilities</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
            
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {reportTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap
                  transition-all duration-200
                  ${selectedReport === type.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{type.name}</span>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        {selectedReport === 'summary' && (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Incidents</p>
                    <p className="text-2xl font-bold text-slate-900">{filteredCrimes.length.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">High Severity</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredCrimes.filter(c => c.severity === 'High').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Districts</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Object.keys(districtData).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Crime Categories</p>
                    <p className="text-2xl font-bold text-purple-600">{categoryData.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Crime Categories Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">District Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={districtChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="district" 
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'temporal' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Hourly Crime Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorHourly)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Severity Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ severity, count }) => `${severity}: ${count}`}
                    >
                      {severityChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.severity === 'High' ? '#EF4444' :
                            entry.severity === 'Medium' ? '#F59E0B' : '#10B981'
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Crime Timeline</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedReport === 'spatial' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Hotspot Clusters</h3>
                <div className="space-y-4">
                  {clusters.map((cluster, index) => (
                    <div key={cluster.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">
                          Cluster {cluster.id + 1}
                        </span>
                        <span 
                          className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${cluster.severity === 'High' ? 'bg-red-100 text-red-800' :
                              cluster.severity === 'Medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }
                          `}
                        >
                          {cluster.severity}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Crimes:</span>
                          <span className="font-medium text-slate-800 ml-2">{cluster.crimes.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Density:</span>
                          <span className="font-medium text-slate-800 ml-2">
                            {(cluster.crimes.length / filteredCrimes.length * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Center: {cluster.centerLat.toFixed(4)}, {cluster.centerLng.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">District Analysis</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={districtChartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b' }} />
                    <YAxis 
                      type="category" 
                      dataKey="district" 
                      stroke="#64748b" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'trends' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Statistical Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(filteredCrimes.length / Math.max(timeSeriesData.length, 1))}
                  </div>
                  <div className="text-sm text-slate-600">Daily Average</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.max(...timeSeriesData.map(d => d.count), 0)}
                  </div>
                  <div className="text-sm text-slate-600">Peak Day</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {categoryData[0]?.category || 'N/A'}
                  </div>
                  <div className="text-sm text-slate-600">Most Common</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Category Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Report Export Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-slate-700 mb-3">Key Findings</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Total of {filteredCrimes.length} crime incidents analyzed</li>
                <li>• {categoryData[0]?.category} is the most common crime type ({categoryData[0]?.percentage}%)</li>
                <li>• {districtChartData[0]?.district} has the highest crime rate ({districtChartData[0]?.count} incidents)</li>
                <li>• {clusters.filter(c => c.severity === 'High').length} high-risk hotspots identified</li>
                <li>• Peak crime hour: {hourlyData.reduce((max, h) => h.count > max.count ? h : max, hourlyData[0]).hour}:00</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-700 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Increase patrol presence in {districtChartData[0]?.district} district</li>
                <li>• Focus on {categoryData[0]?.category} prevention strategies</li>
                <li>• Deploy resources during peak hours (evening/night)</li>
                <li>• Monitor {clusters.filter(c => c.severity === 'High').length} high-risk cluster areas</li>
                <li>• Implement community programs in affected neighborhoods</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;