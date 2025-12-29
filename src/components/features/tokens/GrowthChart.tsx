'use client';

import React from 'react';

interface GrowthChartProps {
    data: number[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
    if (!data || data.length === 0) return null;

    const width = 800;
    const height = 200;
    const padding = 20;

    const maxVal = Math.max(...data) * 1.1;
    const minVal = Math.min(...data) * 0.9;
    const range = maxVal - minVal;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((val - minVal) / range) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');

    const linePath = `M ${points}`;

    // Create an area path for the gradient/fill (though user wants neat, a subtle solid fill is fine if desired, but I'll stick to a clean line)
    const areaPath = `L ${width - padding},${height} L ${padding},${height} Z`;

    return (
        <div style={{ width: '100%', height: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #eee', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Future Expectation</span>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>NAV: ₹{data[data.length - 1].toFixed(2)}</span>
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', display: 'block' }}>
                {/* Clean background grid lines (optional, keeping it minimal) */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#eee" strokeWidth="1" />

                {/* The main projection line */}
                <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />

                {/* Vertical marker at the last point */}
                {data.length > 0 && (
                    <>
                        <circle
                            cx={(data.length - 1) / (data.length - 1) * (width - padding * 2) + padding}
                            cy={height - ((data[data.length - 1] - minVal) / range) * (height - padding * 2) - padding}
                            r="4"
                            fill="white"
                            stroke="#10b981"
                            strokeWidth="2"
                        />
                    </>
                )}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#999' }}>
                <span>Launch</span>
                <span>Current</span>
                <span>Projection</span>
            </div>
        </div>
    );
}
