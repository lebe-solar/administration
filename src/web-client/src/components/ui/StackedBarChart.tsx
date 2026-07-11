'use client';

import { useEffect, useRef } from 'react';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Legend, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { euro } from '@/lib/solarCalc';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Legend, Tooltip, ChartDataLabels);

interface StackedBarChartProps {
  heute: number;
  gridCost: number;
  savings: number;
  feedIn: number;
}

/** "Heute vs. Mit LeBe" stacked cost comparison bar chart. */
export function StackedBarChart({ heute, gridCost, savings, feedIn }: StackedBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<'bar'> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Heute', 'Mit LeBe'],
        datasets: [
          { label: 'Netzbezug', data: [heute, gridCost], backgroundColor: '#3c3c3b', stack: 's', borderRadius: 4 },
          { label: 'Einsparung', data: [0, savings], backgroundColor: '#9fb2a1', stack: 's', borderRadius: 4 },
          { label: 'Einspeisevergütung', data: [0, feedIn], backgroundColor: '#878787', stack: 's', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12, family: 'Soehne, system-ui, sans-serif' }, color: '#3c3c3b' } },
          datalabels: { color: '#fff', font: { weight: 'bold', size: 11, family: 'Soehne, system-ui, sans-serif' }, formatter: (v: number) => (v > 60 ? euro(v) : '') },
          tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + euro(Number(c.raw)) } },
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 13, family: 'Soehne, system-ui, sans-serif' }, color: '#3c3c3b' } },
          y: { stacked: true, ticks: { callback: (v) => v + ' €', font: { size: 11, family: 'Soehne, system-ui, sans-serif' }, color: '#878787' }, grid: { color: '#ebebeb' } },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets[0].data = [heute, gridCost];
    chart.data.datasets[1].data = [0, savings];
    chart.data.datasets[2].data = [0, feedIn];
    chart.update();
  }, [heute, gridCost, savings, feedIn]);

  return (
    <div style={{ position: 'relative', height: 260, minWidth: 0 }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
    </div>
  );
}
