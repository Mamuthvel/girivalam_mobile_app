
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AdminChartsProps {
    chartData: any[]; // Or define a more specific type
    pieData: any[];
    barChartConfig: any;
    pieChartConfig: any;
}

const AdminCharts: React.FC<AdminChartsProps> = ({ chartData, pieData, barChartConfig, pieChartConfig }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card glass-panel rounded-2xl p-6 border border-white/10 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-white/90">
                    User & Booking Growth
                </h3>
                <div className="h-[300px]">
                    <ChartContainer config={barChartConfig} className="h-full w-full">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#888888" />
                            <YAxis stroke="#888888" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="users"
                                fill="var(--color-users)"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="bookings"
                                fill="var(--color-bookings)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>

            <div className="bg-card glass-panel rounded-2xl p-6 border border-white/10 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-white/90">
                    Booking Status Distribution
                </h3>
                <div className="h-[300px]">
                    <ChartContainer config={pieChartConfig} className="h-full w-full">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminCharts;
