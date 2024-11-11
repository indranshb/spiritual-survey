"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  aggregateData: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#808080', '#b768a2', '#7cba3b', '#ff5252'];

const Dashboard = ({ aggregateData }: DashboardProps) => {
  const chartData = Object.entries(aggregateData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalResponses = Object.values(aggregateData).reduce((a, b) => a + b, 0);
  
  const calculatePercentage = (value: number) => {
    return ((value / totalResponses) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-black">Survey Analytics Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-black">Total Responses</h3>
          <p className="text-3xl font-bold text-blue-600">{totalResponses}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-black">Most Common</h3>
          <p className="text-xl font-bold text-green-600">{chartData[0]?.name || 'N/A'}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-black">Unique Personas</h3>
          <p className="text-3xl font-bold text-purple-600">{chartData.length}</p>
        </div>
      </div>

      {/* Distribution Table */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-black">Persona Distribution</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 border-b text-left text-black">Persona</th>
                <th className="py-2 px-4 border-b text-right text-black">Count</th>
                <th className="py-2 px-4 border-b text-right text-black">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(({ name, value }) => (
                <tr key={name} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-black">{name}</td>
                  <td className="py-2 px-4 border-b text-right text-black">{value}</td>
                  <td className="py-2 px-4 border-b text-right text-black">
                    {calculatePercentage(value)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="h-80 border p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-black">Distribution Chart</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12, fill: '#000' }}
                />
                <YAxis tick={{ fill: '#000' }}/>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #999' }}/>
                <Bar dataKey="value" fill="#0088FE">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-black">
              No data available
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="h-80 border p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-black">Percentage Distribution</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${calculatePercentage(value)}%`}
                  labelLine={true}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #999' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-black">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;