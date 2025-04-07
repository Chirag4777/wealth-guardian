import React from 'react';
import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
const RADIAN = Math.PI / 180;

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
      <p className="font-medium text-gray-800 dark:text-gray-200">{payload[0].name}</p>
      <p className="text-sm" style={{ color: payload[0].color }}>
        ₹{parseFloat(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
};

const PieChart = ({ 
  data, 
  title, 
  showLegend = false, 
  showLabels = false,
  innerRadius = 0,
  outerRadius = 80
}) => {
  // If no data or empty array, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Limit to top 8 categories and group the rest as "Other"
  let chartData = [...data];
  if (data.length > 7) {
    const topCategories = data.slice(0, 6);
    const otherCategories = data.slice(6);
    
    const otherValue = otherCategories.reduce((total, item) => total + parseFloat(item.value), 0);
    
    chartData = [
      ...topCategories,
      { name: 'Other', value: otherValue.toFixed(2) }
    ];
  }

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={title ? "calc(100% - 30px)" : "100%"}>
        <ReChartsPie>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? CustomLabel : null}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center" 
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
        </ReChartsPie>
      </ResponsiveContainer>
    </div>
  );
};

// Expose colors for external use
PieChart.COLORS = COLORS;

export default PieChart; 