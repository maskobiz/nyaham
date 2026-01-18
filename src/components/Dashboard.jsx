import React, { useState, useEffect } from 'react';
import { Search, ArrowUp, ArrowDown, BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Card = ({ title, value, subtext, icon: Icon, trend }) => (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">{title}</h3>
            {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
        </div>
        <div className="content">
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-muted-foreground text-xs">{subtext}</p>
            {trend && (
                <div className={cn("flex items-center text-xs mt-2", trend > 0 ? "text-green-500" : "text-red-500")}>
                    {trend > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
    </div>
);

export default function Dashboard() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [stats, setStats] = useState({
        totalStocks: 0,
        totalVolume: 0,
        topGainer: null,
        topLoser: null
    });

    useEffect(() => {
        fetch('/data/stocks.json')
            .then(res => res.json())
            .then(data => {
                const stockList = data.data || [];
                setStocks(stockList);

                // Calculate stats
                const totalVol = stockList.reduce((acc, stock) => acc + (stock.Volume || 0), 0);
                const sortedByChange = [...stockList].sort((a, b) => (b.Change || 0) - (a.Change || 0));

                setStats({
                    totalStocks: stockList.length,
                    totalVolume: totalVol,
                    topGainer: sortedByChange[0],
                    topLoser: sortedByChange[sortedByChange.length - 1]
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load data", err);
                setLoading(false);
            });
    }, []);

    const filteredStocks = stocks.filter(stock =>
        stock.StockCode?.toLowerCase().includes(search.toLowerCase()) ||
        stock.StockName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">IDX Dashboard</h1>
                        <p className="text-muted-foreground">Indonesia Stock Exchange Market Overview</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Data Date: {stocks[0]?.Date ? new Date(stocks[0].Date).toLocaleDateString() : '-'}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card
                        title="Total Listed Stocks"
                        value={stats.totalStocks}
                        icon={BarChart3}
                        subtext="Active companies"
                    />
                    <Card
                        title="Total Volume"
                        value={(stats.totalVolume / 1000000).toFixed(1) + "M"}
                        icon={Activity}
                        subtext="Shares traded today"
                    />
                    <Card
                        title="Top Gainer"
                        value={stats.topGainer?.StockCode || "-"}
                        icon={TrendingUp}
                        subtext={`+${stats.topGainer?.Change} (${((stats.topGainer?.Change / stats.topGainer?.Close) * 100).toFixed(2)}%)`}
                        trend={stats.topGainer?.Change}
                    />
                    <Card
                        title="Top Loser"
                        value={stats.topLoser?.StockCode || "-"}
                        icon={ArrowDown}
                        subtext={`${stats.topLoser?.Change} (${((stats.topLoser?.Change / stats.topLoser?.Close) * 100).toFixed(2)}%)`}
                        trend={stats.topLoser?.Change}
                    />
                </div>

                {/* Stock Table */}
                <div className="rounded-md border bg-card">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Market Data</h2>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Search stocks..."
                                className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="relative w-full overflow-auto max-h-[600px]">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b sticky top-0 bg-card z-10">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Code</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Name</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Last</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Chg</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground hidden sm:table-cell">Vol</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground hidden sm:table-cell">Freq</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center">Loading market data...</td></tr>
                                ) : filteredStocks.map((stock) => (
                                    <tr key={stock.StockCode} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{stock.StockCode}</td>
                                        <td className="p-4 align-middle hidden md:table-cell">{stock.StockName}</td>
                                        <td className="p-4 align-middle text-right">{stock.Close?.toLocaleString()}</td>
                                        <td className={cn(
                                            "p-4 align-middle text-right font-medium",
                                            stock.Change > 0 ? "text-green-500" : stock.Change < 0 ? "text-red-500" : ""
                                        )}>
                                            {stock.Change > 0 ? "+" : ""}{stock.Change}
                                        </td>
                                        <td className="p-4 align-middle text-right hidden sm:table-cell">{stock.Volume?.toLocaleString()}</td>
                                        <td className="p-4 align-middle text-right hidden sm:table-cell">{stock.Frequency?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
