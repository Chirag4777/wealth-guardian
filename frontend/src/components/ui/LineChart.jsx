import React, { useRef, useEffect } from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
      <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="text-sm">
          {entry.name}: ₹{parseFloat(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const LineChart = ({ 
  data = [], 
  dataKeys = [], 
  colors = ['#8884d8', '#82ca9d'], 
  height = 300,
  showGrid = true,
  showLegend = false 
}) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    const updateWidth = () => {
      // We keep this function to adjust the chart if needed in the future
    };
    
    // Set initial width
    updateWidth();
    
    // Update width on resize
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-md">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }
  
  // Format data to ensure all values are numeric
  const formattedData = data.map(item => {
    const newItem = { ...item };
    dataKeys.forEach(key => {
      if (item[key]) {
        newItem[key] = parseFloat(item[key]);
      }
    });
    return newItem;
  });
  
  return (
    <div ref={chartRef} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          
          {dataKeys.map((dataKey, index) => (
            <Line
              key={dataKey}
              type="monotone"
              dataKey={dataKey}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ stroke: colors[index % colors.length], strokeWidth: 2, r: 4 }}
              activeDot={{ stroke: colors[index % colors.length], strokeWidth: 2, r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart; 