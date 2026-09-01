'use client';

import { useCallback, useMemo, type MouseEvent, type TouchEvent } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AreaClosed, LinePath } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { curveMonotoneX } from '@visx/curve';
import { bisector, max as d3max } from 'd3-array';
import { formatCompactCurrency, formatCurrency } from '@/shared/lib/formatters';
import type { DailyTotal } from '../utils/aggregateTransactions';

const MARGIN = { top: 16, right: 16, bottom: 28, left: 56 };

const getDate = (d: DailyTotal) => d.date;
const getIncome = (d: DailyTotal) => d.income;
const getExpense = (d: DailyTotal) => d.expense;
const bisectDate = bisector<DailyTotal, Date>((d) => d.date).left;

interface ChartProps {
  width: number;
  height: number;
  data: DailyTotal[];
}

/**
 * На відміну від Recharts (проект 1 обговорював цю альтернативу), тут
 * усе — scales, axes, крива, tooltip-логіка з bisector — написано вручну.
 * Це і є та "гнучкість Visx", заради якої його обрали: повний контроль
 * над кожним пікселем, ціною більшого обсягу коду.
 */
function Chart({ width, height, data }: ChartProps) {
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip<DailyTotal>();

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [getDate(data[0]), getDate(data[data.length - 1])],
        range: [0, innerWidth],
      }),
    [innerWidth, data]
  );

  const yMax = useMemo(
    () => d3max(data, (d) => Math.max(getIncome(d), getExpense(d))) ?? 0,
    [data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        // *1.15 — трохи запасу зверху, щоб пік лінії не впирався в самий
        // верх графіка; `|| 1` захищає від domain [0, 0], якщо всі суми нульові
        domain: [0, yMax * 1.15 || 1],
        range: [innerHeight, 0],
        nice: true,
      }),
    [innerHeight, yMax]
  );

  const handlePointerMove = useCallback(
    (event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) return;

      // localPoint повертає координати відносно самого <svg> (його власна
      // система координат), а НЕ відносно внутрішньої <Group left={MARGIN.left}>,
      // де реально намальовані лінії й цей rect. xScale/yScale натомість
      // побудовані у координатах, вже зсунутих на margin (range: [0, innerWidth]).
      // Без цього віднімання розрахунок "найближчої точки" завжди був би
      // зміщений на MARGIN.left праворуч від реального курсора — саме
      // це й спричиняло помітний зсув, особливо біля лівого краю графіка.
      const x = point.x - MARGIN.left;

      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const dLeft = data[index - 1];
      const dRight = data[index];

      let closest = dLeft;
      if (dRight) {
        closest =
          x0.valueOf() - dLeft.date.valueOf() > dRight.date.valueOf() - x0.valueOf()
            ? dRight
            : dLeft;
      }

      showTooltip({
        tooltipData: closest,
        tooltipLeft: xScale(getDate(closest)),
        tooltipTop: yScale(Math.max(getIncome(closest), getExpense(closest))),
      });
    },
    [xScale, yScale, data, showTooltip]
  );

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <LinearGradient
          id="income-area-gradient"
          from="var(--income)"
          to="var(--income)"
          fromOpacity={0.35}
          toOpacity={0}
        />
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows
            scale={yScale}
            width={innerWidth}
            stroke="var(--border)"
            strokeDasharray="2,3"
          />

          {/* Дохід — заливка (area), бо це "накопичувальна" величина,
              природний базовий шар графіка */}
          <AreaClosed
            data={data}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yScale(getIncome(d)) ?? 0}
            yScale={yScale}
            curve={curveMonotoneX}
            fill="url(#income-area-gradient)"
          />
          <LinePath
            data={data}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yScale(getIncome(d)) ?? 0}
            curve={curveMonotoneX}
            stroke="var(--income)"
            strokeWidth={2}
          />

          {/* Витрата — тільки лінія (пунктир), навмисно БЕЗ заливки —
              це "накладена" величина для порівняння, а не базовий шар */}
          <LinePath
            data={data}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yScale(getExpense(d)) ?? 0}
            curve={curveMonotoneX}
            stroke="var(--expense)"
            strokeWidth={2}
            strokeDasharray="5,4"
          />

          <AxisLeft
            scale={yScale}
            stroke="var(--border)"
            tickStroke="var(--border)"
            numTicks={4}
            tickFormat={(value) => formatCompactCurrency(Number(value))}
            tickLabelProps={{ fill: 'var(--faint)', fontSize: 10 }}
          />
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke="var(--border)"
            tickStroke="var(--border)"
            numTicks={Math.min(data.length, 6)}
            tickLabelProps={{ fill: 'var(--faint)', fontSize: 10 }}
          />

          {tooltipData && (
            <g pointerEvents="none">
              <line
                x1={xScale(getDate(tooltipData))}
                x2={xScale(getDate(tooltipData))}
                y1={0}
                y2={innerHeight}
                stroke="var(--faint)"
                strokeDasharray="2,2"
              />
              <circle cx={xScale(getDate(tooltipData))} cy={yScale(getIncome(tooltipData))} r={4} fill="var(--income)" />
              <circle cx={xScale(getDate(tooltipData))} cy={yScale(getExpense(tooltipData))} r={4} fill="var(--expense)" />
            </g>
          )}

          {/* Прозорий rect поверх усього — саме він ловить mousemove для
              tooltip; окремий елемент, бо lines/areas не мають суцільної
              area для наведення по всій ширині графіка */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseMove={handlePointerMove}
            onTouchMove={handlePointerMove}
            onMouseLeave={hideTooltip}
            onTouchEnd={hideTooltip}
          />
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={tooltipLeft !== undefined ? tooltipLeft + MARGIN.left : undefined}
          top={tooltipTop !== undefined ? tooltipTop + MARGIN.top : undefined}
          style={{
            ...defaultStyles,
            backgroundColor: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}
        >
          <div className="space-y-1 text-xs">
            <p className="text-faint">
              {getDate(tooltipData).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
            </p>
            <p className="text-income">Income: {formatCurrency(getIncome(tooltipData))}</p>
            <p className="text-expense">Expense: {formatCurrency(getExpense(tooltipData))}</p>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}

interface SpendingChartProps {
  data: DailyTotal[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <div className="h-72 w-full rounded-lg border border-border bg-surface p-4">
      {/* ParentSize вимірює реальний розмір батьківського контейнера в
          браузері — тому й весь графік має бути 'use client': на сервері
          немає layout-розрахунків, розмір просто невідомий */}
      <ParentSize>{({ width, height }) => <Chart width={width} height={height} data={data} />}</ParentSize>
    </div>
  );
}
