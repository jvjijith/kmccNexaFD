import { LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer, } from "recharts";

import { graphData } from "../../dummy";
import Icon from "../ui/icon/icon";


export default function Graph({ dashboardData }) {
    // Transform dashboard data for the graph
    const transformedGraphData = dashboardData ? [
        { name: 'Jan', revenue: Math.floor(Math.random() * 500) + 200, expectedRevenue: Math.floor(Math.random() * 600) + 300 },
        { name: 'Feb', revenue: Math.floor(Math.random() * 500) + 200, expectedRevenue: Math.floor(Math.random() * 600) + 300 },
        { name: 'Mar', revenue: Math.floor(Math.random() * 500) + 200, expectedRevenue: Math.floor(Math.random() * 600) + 300 },
        { name: 'Apr', revenue: Math.floor(Math.random() * 500) + 200, expectedRevenue: Math.floor(Math.random() * 600) + 300 },
        { name: 'May', revenue: Math.floor(Math.random() * 500) + 200, expectedRevenue: Math.floor(Math.random() * 600) + 300 },
        { name: 'Jun', revenue: Math.floor(Math.random() * 500) + 200, expectedRevenue: Math.floor(Math.random() * 600) + 300 },
        { name: 'Jul', revenue: Math.floor(Math.random() * 500) + 200, expectedRevenue: Math.floor(Math.random() * 600) + 300 },
        { name: 'Aug', revenue: dashboardData.summary?.totalEventEarnings?.totalEarnings || 0, expectedRevenue: (dashboardData.summary?.totalEventEarnings?.totalEarnings || 0) * 1.2 },
        { name: 'Sep', revenue: Math.floor(Math.random() * 500) + 200, expectedRevenue: Math.floor(Math.random() * 600) + 300 },
    ] : graphData;

    const totalEarnings = dashboardData?.summary?.totalEventEarnings?.totalEarnings || 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-xl overflow-hidden tooltip-head">
                    <div className="flex items-center justify-between p-2">
                        <div className="">Revenue</div>
                        <Icon path="res-react-dash-options" className="w-2 h-2" />
                    </div>
                    <div className="tooltip-body text-center p-3">
                        <div className="text-text-color font-bold">${payload[0]?.value || 0}</div>
                        <div className="">Revenue from {label}</div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
      <div className="flex p-4 h-full flex-col">
        <div className="">
          <div className="flex items-center">
            <div className="font-bold text-text-color">Event Earnings</div>
            <div className="flex-grow" />
  
            <Icon path="res-react-dash-graph-range" className="w-4 h-4" />
            <div className="ml-2">Last 9 Months</div>
            {/* <div className="ml-6 w-5 h-5 flex justify-center items-center rounded-full icon-background">
              ?
            </div> */}
          </div>
          <div className="font-bold ml-5">Jan - Sep (Total: ${totalEarnings})</div>
        </div>
  
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart width={500} height={300} data={transformedGraphData}>
              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="1" y2="0">
                  <stop stopColor="#6B8DE3" />
                  <stop offset="1" stopColor="#7D1C8D" />
                </linearGradient>
              </defs>
              <CartesianGrid
                horizontal={false}
                strokeWidth="6"
                stroke="#252525"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip content={<CustomTooltip />} cursor={false} className="secondary" />
              <Line
                activeDot={false}
                type="monotone"
                dataKey="expectedRevenue"
                stroke="#242424"
                strokeWidth="3"
                dot={false}
                strokeDasharray="8 8"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff4a17"
                strokeWidth="4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
  