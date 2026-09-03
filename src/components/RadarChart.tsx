'use client';

import { useRef } from 'react';
import styles from './RadarChart.module.css';

interface Level {
  value: number;
  label: string;
}

interface Axis {
  id: string;
  label: string;
  levels: Level[];
}

interface RadarArchetype {
  id: string;
  name: string;
  color: string;
  values: Record<string, number>;
}

interface Props {
  archetype: RadarArchetype;
  axes: Axis[];
  subtypeOf?: string;
}

const CX = 200;
const CY = 200;
const R = 120;
const LABEL_R = 148;
const VALUE_LABEL_R = 132;
const N = 5;

function toRad(deg: number) { return (deg * Math.PI) / 180; }

function axisAngle(i: number) {
  return toRad(-90 + (360 / N) * i);
}

function polar(r: number, angle: number) {
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function gridPolygon(fraction: number) {
  return Array.from({ length: N }, (_, i) => {
    const { x, y } = polar(R * fraction, axisAngle(i));
    return `${x},${y}`;
  }).join(' ');
}

function textAnchor(angle: number) {
  const cos = Math.cos(angle);
  if (cos > 0.15) return 'start';
  if (cos < -0.15) return 'end';
  return 'middle';
}

function valueLabel(axisId: string, value: number, levels: Level[]) {
  const sorted = [...levels].sort((a, b) => Math.abs(a.value - value) - Math.abs(b.value - value));
  return sorted[0]?.label ?? String(value);
}

export default function RadarChart({ archetype, axes, subtypeOf }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  function openFullscreen() {
    cardRef.current?.requestFullscreen?.();
  }

  const dataPoints = axes.map((axis, i) => {
    const v = archetype.values[axis.id] ?? 0;
    const frac = v / 100;
    return polar(R * frac, axisAngle(i));
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z';

  return (
    <div ref={cardRef} className={`${styles.card} ${subtypeOf ? styles.subtypeCard : ''}`}>
      <div className={styles.cardHeader} style={{ borderTopColor: archetype.color }}>
        <span className={styles.colorDot} style={{ background: archetype.color }} />
        <div className={styles.cardHeaderText}>
          <h3 className={styles.cardTitle}>{archetype.name}</h3>
          {subtypeOf && (
            <span className={styles.subtypeBadge}>
              Subtipo de {subtypeOf}
            </span>
          )}
        </div>
        <button
          className={styles.fullscreenBtn}
          onClick={openFullscreen}
          title="Ver en pantalla completa"
          aria-label="Pantalla completa"
        >
          ⛶
        </button>
      </div>

      <div className={styles.svgWrapper}>
      <svg viewBox="-60 0 520 400" className={styles.svg} aria-label={`Diagrama radial de ${archetype.name}`}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={gridPolygon(f)}
            fill="none"
            stroke="var(--border)"
            strokeWidth={f === 1 ? 1.5 : 1}
            strokeDasharray={f === 1 ? undefined : '4 3'}
          />
        ))}

        {/* Grid ring labels (25 / 50 / 75 / 100) */}
        {[25, 50, 75, 100].map((pct) => {
          const { x, y } = polar(R * (pct / 100), axisAngle(0));
          return (
            <text key={pct} x={x + 4} y={y - 3} fontSize="9" fill="var(--text-muted)" textAnchor="start">
              {pct}
            </text>
          );
        })}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const end = polar(R, axisAngle(i));
          return (
            <line
              key={i}
              x1={CX} y1={CY}
              x2={end.x.toFixed(2)} y2={end.y.toFixed(2)}
              stroke="var(--border)"
              strokeWidth={1}
            />
          );
        })}

        {/* Filled data polygon */}
        <path
          d={dataPath}
          fill={archetype.color + '2a'}
          stroke={archetype.color}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r={4} fill={archetype.color} />
        ))}

        {/* Value labels at each data point */}
        {axes.map((axis, i) => {
          const angle = axisAngle(i);
          const v = archetype.values[axis.id] ?? 0;
          const frac = v / 100;
          const labelR = frac > 0.1 ? R * frac + 14 : R * 0.18;
          const { x, y } = polar(labelR, angle);
          const label = valueLabel(axis.id, v, axis.levels);
          return (
            <text
              key={axis.id}
              x={x.toFixed(2)}
              y={y.toFixed(2)}
              fontSize="9.5"
              fill={archetype.color}
              fontWeight="600"
              textAnchor={textAnchor(angle)}
              dominantBaseline="middle"
            >
              {label}
            </text>
          );
        })}

        {/* Axis labels (criterion names) */}
        {axes.map((axis, i) => {
          const angle = axisAngle(i);
          const { x, y } = polar(LABEL_R, angle);
          const anchor = textAnchor(angle);
          const words = axis.label.split(' ');
          return (
            <text
              key={axis.id}
              x={x.toFixed(2)}
              y={y.toFixed(2)}
              fontSize="10.5"
              fill="var(--text-secondary)"
              fontWeight="600"
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {words.length > 1 ? (
                <>
                  <tspan x={x.toFixed(2)} dy="-6">{words.slice(0, Math.ceil(words.length / 2)).join(' ')}</tspan>
                  <tspan x={x.toFixed(2)} dy="13">{words.slice(Math.ceil(words.length / 2)).join(' ')}</tspan>
                </>
              ) : axis.label}
            </text>
          );
        })}
      </svg>
      </div>

      {/* Legend table */}
      <table className={styles.table}>
        <tbody>
          {axes.map((axis) => {
            const v = archetype.values[axis.id] ?? 0;
            const label = valueLabel(axis.id, v, axis.levels);
            const pct = v;
            return (
              <tr key={axis.id} className={styles.row}>
                <td className={styles.axisName}>{axis.label}</td>
                <td className={styles.barCell}>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${pct}%`, background: archetype.color }}
                    />
                  </div>
                </td>
                <td className={styles.valueLabel} style={{ color: archetype.color }}>{label}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
