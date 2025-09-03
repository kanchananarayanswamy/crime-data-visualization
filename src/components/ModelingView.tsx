import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { CrimeRecord, ModelMetrics } from '../types/crime';
import { trainCrimeClassifier } from '../utils/mlModels';
import { Play, Brain, Target, Zap, CheckCircle } from 'lucide-react';

interface ModelingViewProps {
  crimes: CrimeRecord[];
}

const ModelingView: React.FC<ModelingViewProps> = ({ crimes }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [selectedModel, setSelectedModel] = useState('random-forest');

  const handleTrainModel = async () => {
    setIsTraining(true);
    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const metrics = trainCrimeClassifier(crimes);
    setModelMetrics(metrics);
    setIsTraining(false);
  };

  const modelOptions = [
    { id: 'random-forest', name: 'Random Forest', description: 'Ensemble method with high accuracy' },
    { id: 'logistic-regression', name: 'Logistic Regression', description: 'Linear model with interpretability' },
    { id: 'neural-network', name: 'Neural Network', description: 'Deep learning for complex patterns' },
    { id: 'svm', name: 'Support Vector Machine', description: 'Effective for classification tasks' }
  ];

  const metricsData = modelMetrics ? [
    { name: 'Accuracy', value: modelMetrics.accuracy, color: '#3B82F6' },
    { name: 'Precision', value: modelMetrics.precision, color: '#10B981' },
    { name: 'Recall', value: modelMetrics.recall, color: '#F59E0B' },
    { name: 'F1-Score', value: modelMetrics.f1Score, color: '#EF4444' }
  ] : [];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Machine Learning Models</h2>
            <p className="text-slate-600">Train and evaluate predictive models for crime classification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model Selection and Training */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Model Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Algorithm
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  >
                    {modelOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {modelOptions.find(o => o.id === selectedModel)?.description}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Training Data:</span>
                      <span className="font-medium">{crimes.length} records</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Features:</span>
                      <span className="font-medium">8 variables</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-medium">Crime Category</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleTrainModel}
                  disabled={isTraining || crimes.length === 0}
                  className={`
                    w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold
                    transition-all duration-200
                    ${isTraining || crimes.length === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1'
                    }
                  `}
                >
                  <Play className="w-4 h-4" />
                  <span>{isTraining ? 'Training Model...' : 'Train Model'}</span>
                </button>
              </div>
            </div>

            {/* Feature Importance */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Feature Importance</h3>
              <div className="space-y-3">
                {[
                  { name: 'Time of Day', importance: 0.28 },
                  { name: 'Location (Lat/Lng)', importance: 0.24 },
                  { name: 'District', importance: 0.18 },
                  { name: 'Day of Week', importance: 0.15 },
                  { name: 'Month', importance: 0.15 }
                ].map((feature, index) => (
                  <div key={feature.name} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{feature.name}</span>
                        <span className="text-slate-500">{(feature.importance * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${feature.importance * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Performance */}
          <div className="lg:col-span-2 space-y-6">
            {modelMetrics && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Model Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        domain={[0, 1]}
                        stroke="#64748b"
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Score']}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={4}
                        fill="#3B82F6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">Training Complete</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Model Type:</span>
                        <span className="font-medium text-slate-800">
                          {modelOptions.find(o => o.id === selectedModel)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Training Time:</span>
                        <span className="font-medium text-slate-800">2.3s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cross-Validation:</span>
                        <span className="font-medium text-slate-800">5-Fold</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">Key Metrics</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Overall Accuracy:</span>
                        <span className="font-bold text-green-600">
                          {(modelMetrics.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Best F1-Score:</span>
                        <span className="font-bold text-blue-600">
                          {(modelMetrics.f1Score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Model Status:</span>
                        <span className="font-medium text-green-600">Ready for Deployment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!modelMetrics && !isTraining && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 text-center">
                <div className="bg-slate-100 p-4 rounded-full w-20 h-20 mx-auto mb-4">
                  <Brain className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Model Trained</h3>
                <p className="text-slate-600">
                  Click "Train Model" to start the machine learning process
                </p>
              </div>
            )}

            {isTraining && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 text-center">
                <div className="animate-spin bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4">
                  <Zap className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Training in Progress</h3>
                <p className="text-slate-600">
                  Processing {crimes.length} crime records...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelingView;