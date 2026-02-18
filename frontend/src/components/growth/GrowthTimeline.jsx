import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import RiskBadge from '../common/RiskBadge';
import VerifiedTag from '../common/VerifiedTag';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
                <p className="font-bold text-gray-900 mb-2">{new Date(data.date).toLocaleDateString()}</p>
                <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                        <span className="font-bold text-blue-600">Height:</span> {data.height} cm
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-bold text-green-600">Weight:</span> {data.weight} kg
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-bold text-purple-600">BMI:</span> {data.bmi}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-bold text-orange-600">Percentile:</span> {data.percentile}th
                    </p>
                    <div className="mt-2">
                        <RiskBadge risk={data.riskStatus} />
                    </div>
                </div>
                {data.notes && (
                    <div className="mt-2 text-xs text-gray-400 italic border-t pt-2 w-40">
                        "{data.notes}"
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const GrowthTimeline = ({ data, onDelete }) => {
    const formattedData = data.map(record => ({
        ...record,
        date: record.timestamp, // Ensure date exists for axis
    }));

    // Latest Record logic
    const latest = formattedData[formattedData.length - 1];

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No growth records found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            {latest && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-100 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
                        <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">Current BMI</p>
                        <h3 className="text-4xl font-black text-gray-900">{latest.bmi}</h3>
                        <div className="mt-2 flex gap-2">
                            <RiskBadge risk={latest.riskStatus} />
                            <span className="text-xs font-bold text-gray-500 self-center">{latest.percentile}th Percentile</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Height</p>
                                <p className="text-2xl font-black text-gray-900">{latest.height} cm</p>
                            </div>
                            <div className="text-3xl">📏</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Weight</p>
                                <p className="text-2xl font-black text-gray-900">{latest.weight} kg</p>
                            </div>
                            <div className="text-3xl">⚖️</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>📈</span> Growth Trends
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                stroke="#9ca3af"
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#9ca3af"
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                                domain={['auto', 'auto']}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#9ca3af"
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="weight"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Weight (kg)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="bmi"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="BMI"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* History Table */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900">History Records</h3>
                {formattedData.slice().reverse().map((record) => (
                    <motion.div
                        key={record._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center"
                    >
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900">{new Date(record.timestamp).toLocaleDateString()}</span>
                                <VerifiedTag verified={record.verified} />
                            </div>
                            <div className="text-sm text-gray-500 mt-1 flex gap-3">
                                <span>{record.height} cm / {record.weight} kg</span>
                                <span className="text-gray-300">|</span>
                                <span>BMI: {record.bmi}</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <RiskBadge risk={record.riskStatus} />
                            <div className="text-xs text-gray-400 mt-1">{record.percentile}th %</div>
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(record._id)}
                                    className="mt-2 text-xs text-red-400 hover:text-red-600 underline"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default GrowthTimeline;
