import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { CrimeRecord } from '../types/crime';
import { parseCSV, generateSampleCrimeData } from '../utils/dataProcessing';

interface DataUploadProps {
  onDataLoad: (data: CrimeRecord[]) => void;
  isLoading: boolean;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataLoad, isLoading }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const parsedData = parseCSV(csvText);
        onDataLoad(parsedData);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    };
    reader.readAsText(file);
  }, [onDataLoad]);

  const handleLoadSampleData = () => {
    const sampleData = generateSampleCrimeData();
    onDataLoad(sampleData);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Crime Data Analysis Dashboard
          </h2>
          <p className="text-lg text-slate-600">
            Upload your crime data CSV file or use sample data to get started with analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* File Upload Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Upload CSV File
              </h3>
              <p className="text-slate-600 mb-6">
                Upload your crime data in CSV format
              </p>
              
              <label className="block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <div className={`
                  border-2 border-dashed border-slate-300 rounded-lg p-8 
                  cursor-pointer hover:border-blue-400 hover:bg-blue-50
                  transition-all duration-200
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">
                    {isLoading ? 'Processing...' : 'Click to upload CSV file'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Sample Data Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Use Sample Data
              </h3>
              <p className="text-slate-600 mb-6">
                Start with pre-generated sample crime data
              </p>
              
              <button
                onClick={handleLoadSampleData}
                disabled={isLoading}
                className={`
                  w-full bg-green-600 text-white py-3 px-6 rounded-lg
                  font-semibold transition-all duration-200
                  ${isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-1'
                  }
                `}
              >
                {isLoading ? 'Loading...' : 'Load Sample Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Data Format Info */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">Expected CSV Format</h4>
              <p className="text-amber-700 mb-3">
                Your CSV file should contain the following columns:
              </p>
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <code className="text-sm text-slate-700">
                  id, date, time, category, description, latitude, longitude, district, severity
                </code>
              </div>
              <p className="text-sm text-amber-600 mt-2">
                Missing columns will be filled with default values
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;