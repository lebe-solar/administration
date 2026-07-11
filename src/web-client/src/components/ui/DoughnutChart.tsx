'use client';

import { useEffect, useRef } from 'react';
import { Chart, ArcElement, DoughnutController, Tooltip, type Plugin } from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip);

const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'lebeCenter',
  afterDraw(chart) {
    const cfg = (chart.config.options?.plugins as Record<string, { text?: string; sub?: string }> | undefined)?.lebeCenter;
    if (!cfg?.text) return;
    const { ctx, chartArea } = chart;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3c3c3b';
    ctx.font = '700 34px Soehne, system-ui, sans-serif';
    ctx.fillText(cfg.text, cx, cy - 4);
    ctx.fillStyle = '#878787';
    ctx.font = '400 13px Soehne, system-ui, sans-serif';
    ctx.fillText(cfg.sub || '', cx, cy + 22);
    ctx.restore();
  },
};
Chart.register(centerTextPlugin);

interface DoughnutChartProps {
  pct: number;
  color: string;
  label: string;
}

/** Two-segment doughnut with a custom center-text plugin (percentage + label). */
export function DoughnutChart({ pct, color, label }: DoughnutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<'doughnut'> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [label, 'Rest'],
        datasets: [{ data: [pct, Math.max(0, 100 - pct)], backgroundColor: [color, '#e3e3e3'], borderColor: '#f1f0ec', borderWidth: 4 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          lebeCenter: { text: pct + '%', sub: label },
          tooltip: { callbacks: { label: (c) => c.label + ': ' + c.raw + ' %' } },
        } as Chart<'doughnut'>['options']['plugins'],
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
    chart.data.datasets[0].data = [pct, Math.max(0, 100 - pct)];
    (chart.options.plugins as Record<string, unknown>).lebeCenter = { text: pct + '%', sub: label };
    chart.update();
  }, [pct, color, label]);

  return (
    <div style={{ position: 'relative', height: 160, minWidth: 0 }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
    </div>
  );
}
