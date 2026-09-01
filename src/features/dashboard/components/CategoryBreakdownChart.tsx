'use client';

import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { ParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { formatCurrency } from '@/shared/lib/formatters';
import type { CategoryBreakdownItem } from '../utils/aggregateTransactions';

interface ChartProps {
  width: number;
  height: number;
  data: CategoryBreakdownItem[];
  total: number;
}

function Chart({ width, height, data, total }: ChartProps) {
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip<CategoryBreakdownItem>();

  const radius = Math.min(width, height) / 2;
  const donutThickness = radius * 0.35;

  if (radius <= 0) return null;

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <Group top={height / 2} left={width / 2}>
          <Pie
            data={data}
            pieValue={(d) => d.total}
            outerRadius={radius}
            innerRadius={radius - donutThickness}
            padAngle={0.02}
          >
            {(pie) =>
              pie.arcs.map((arc) => {
                const path = pie.path(arc) ?? undefined;
                const isDimmed = Boolean(tooltipData) && tooltipData?.categoryId !== arc.data.categoryId;

                return (
                  <path
                    key={arc.data.categoryId}
                    d={path}
                    fill={arc.data.color}
                    stroke="var(--surface)"
                    strokeWidth={2}
                    opacity={isDimmed ? 0.35 : 1}
                    style={{ cursor: 'pointer', transition: 'opacity 150ms ease' }}
                    onMouseMove={(event) => {
                      const point = localPoint(event) ?? { x: width / 2, y: height / 2 };
                      showTooltip({ tooltipData: arc.data, tooltipLeft: point.x, tooltipTop: point.y });
                    }}
                    onMouseLeave={hideTooltip}
                  />
                );
              })
            }
          </Pie>

          {/* Центр донат-діаграми — загальна сума, порожній innerRadius
              якраз і залишений під цей текст */}
          <text textAnchor="middle" dy="-0.3em" fontSize={10} fill="var(--faint)">
            Total spent
          </text>
          <text textAnchor="middle" dy="1.3em" fontSize={15} fontWeight={600} fill="var(--text)">
            {formatCurrency(total)}
          </text>
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={tooltipLeft}
          top={tooltipTop}
          style={{
            ...defaultStyles,
            backgroundColor: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}
        >
          <div className="space-y-1 text-xs">
            <p className="font-medium" style={{ color: tooltipData.color }}>
              {tooltipData.name}
            </p>
            <p className="text-muted">
              {formatCurrency(tooltipData.total)} · {((tooltipData.total / total) * 100).toFixed(1)}%
            </p>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}

interface CategoryBreakdownChartProps {
  data: CategoryBreakdownItem[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
        Немає витрат за цей період.
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="mx-auto h-56 w-56 shrink-0 sm:mx-0">
          <ParentSize>
            {({ width, height }) => <Chart width={width} height={height} data={data} total={total} />}
          </ParentSize>
        </div>

        <ul className="flex-1 space-y-2">
          {data.map((item) => (
            <li key={item.categoryId} className="flex items-center gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="ml-auto shrink-0 whitespace-nowrap font-mono tabular-nums text-muted">
                {formatCurrency(item.total)} · {((item.total / total) * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
