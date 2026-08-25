'use client';

import { useRef } from 'react';
import styles from './CombinedRadarChart.module.css';

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
  parentId?: string;
  values: Record<string, number>;
}

interface Props {
  archetypes: RadarArchetype[];
  axes: Axis[];
}

const CX = 210;
const CY = 210;
const R = 130;
const LABEL_R = 160;
const N = 5;

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function axisAngle(i: number) { return toRad(-90 + (360 / N) * i); }
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

export default function CombinedRadarChart({ archetypes, axes }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  function openFullscreen() {
    cardRef.current?.requestFullscreen?.();
  }

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>Comparativa Global</h3>
          <p className={styles.cardDesc}>Todos los arquetipos superpuestos en un mismo diagrama radial</p>
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

      <div className={styles.body}>
        <svg viewBox="0 0 420 420" className={styles.svg} aria-label="Diagrama radial comparativo de todos los arquetipos">
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

          {/* Grid ring % labels */}
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

          {/* Each archetype polygon — subtypes with dashed stroke */}
          {archetypes.map((arch) => {
            const points = axes.map((axis, i) => {
              const v = arch.values[axis.id] ?? 0;
              return polar(R * (v / 100), axisAngle(i));
            });
            const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z';
            const isSubtype = !!arch.parentId;
            return (
              <g key={arch.id}>
                <path
                  d={d}
                  fill={arch.color + '20'}
                  stroke={arch.color}
                  strokeWidth={isSubtype ? 1.5 : 2}
                  strokeDasharray={isSubtype ? '6 3' : undefined}
                  strokeLinejoin="round"
                />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r={isSubtype ? 3 : 4} fill={arch.color} />
                ))}
              </g>
            );
          })}

          {/* Axis labels */}
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
                {words.length > 2 ? (
                  <>
                    <tspan x={x.toFixed(2)} dy="-6">{words.slice(0, Math.ceil(words.length / 2)).join(' ')}</tspan>
                    <tspan x={x.toFixed(2)} dy="13">{words.slice(Math.ceil(words.length / 2)).join(' ')}</tspan>
                  </>
                ) : axis.label}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className={styles.legend}>
          {archetypes.map((arch) => (
            <div key={arch.id} className={styles.legendItem}>
              <svg width="24" height="10" className={styles.legendLine}>
                <line
                  x1="0" y1="5" x2="24" y2="5"
                  stroke={arch.color}
                  strokeWidth={arch.parentId ? 1.5 : 2}
                  strokeDasharray={arch.parentId ? '5 2' : undefined}
                />
                <circle cx="12" cy="5" r={arch.parentId ? 2.5 : 3.5} fill={arch.color} />
              </svg>
              <span className={styles.legendLabel} style={{ color: arch.parentId ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                {arch.name}
                {arch.parentId && <em className={styles.legendSub}> (subtipo)</em>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
