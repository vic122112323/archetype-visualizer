'use client';

import { useRef } from 'react';
import styles from './ReferenceRadar.module.css';

interface Level {
  value: number;
  label: string;
}

interface Axis {
  id: string;
  label: string;
  levels: Level[];
}

interface Props {
  axes: Axis[];
}

// Geometry constants for the empty reference radar
const CX = 250;
const CY = 250;
const R = 180;
// Inner radius for value 0, so the five "0" labels do not pile up in the center
const R0 = 46;
const LABEL_R = 214;
const N = 5;

function toRad(deg: number) { return (deg * Math.PI) / 180; }

function axisAngle(i: number) {
  return toRad(-90 + (360 / N) * i);
}

function polar(r: number, angle: number) {
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

// Maps a 0-100 value to its radius on the ringed scale
function valueRadius(value: number) {
  return R0 + (R - R0) * (value / 100);
}

function gridPolygon(value: number) {
  return Array.from({ length: N }, (_, i) => {
    const { x, y } = polar(valueRadius(value), axisAngle(i));
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

function textAnchor(angle: number) {
  const cos = Math.cos(angle);
  if (cos > 0.15) return 'start';
  if (cos < -0.15) return 'end';
  return 'middle';
}

// Empty radar used as a reading key: criteria on the tips, their scale values on each point
export default function ReferenceRadar({ axes }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  function openFullscreen() {
    cardRef.current?.requestFullscreen?.();
  }

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderText}>
          <h3 className={styles.cardTitle}>Mapa de los ejes</h3>
          <span className={styles.cardSubtitle}>
            Diagrama vacío con los criterios en cada punta y el valor que toma la escala en cada punto
          </span>
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
        <svg viewBox="-60 -30 620 580" className={styles.svg} aria-label="Diagrama radial vacío con los criterios y sus valores">
          {[0, 25, 50, 75, 100].map((v) => (
            <polygon
              key={v}
              points={gridPolygon(v)}
              fill="none"
              stroke="var(--border)"
              strokeWidth={v === 100 ? 1.5 : 1}
              strokeDasharray={v === 100 || v === 0 ? undefined : '4 3'}
            />
          ))}

          {axes.map((axis, i) => {
            const angle = axisAngle(i);
            const start = polar(R0, angle);
            const end = polar(R, angle);
            return (
              <line
                key={axis.id}
                x1={start.x.toFixed(2)} y1={start.y.toFixed(2)}
                x2={end.x.toFixed(2)} y2={end.y.toFixed(2)}
                stroke="var(--border)"
                strokeWidth={1}
              />
            );
          })}

          {/* Level markers: one dot per defined value, labelled with its meaning */}
          {axes.map((axis, i) => {
            const angle = axisAngle(i);
            // Offset the text perpendicular to the axis so it never sits on the line
            const perp = angle + Math.PI / 2;
            const anchor = textAnchor(perp);
            return (
              <g key={axis.id}>
                {axis.levels.map((lv) => {
                  const p = polar(valueRadius(lv.value), angle);
                  const tx = p.x + Math.cos(perp) * 9;
                  const ty = p.y + Math.sin(perp) * 9;
                  return (
                    <g key={lv.value}>
                      <circle cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r={3.5} fill="var(--text-muted)" />
                      <text
                        x={tx.toFixed(2)}
                        y={ty.toFixed(2)}
                        fontSize="9.5"
                        textAnchor={anchor}
                        dominantBaseline="middle"
                        className={styles.levelText}
                      >
                        <tspan className={styles.levelNum}>{lv.value}</tspan>
                        <tspan dx="4">{lv.label}</tspan>
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Criterion names on each tip */}
          {axes.map((axis, i) => {
            const angle = axisAngle(i);
            const { x, y } = polar(LABEL_R, angle);
            const anchor = textAnchor(angle);
            const words = axis.label.split(' ');
            const lines = words.length > 1
              ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
              : [axis.label];
            const outwardIsUp = Math.sin(angle) < 0;
            const lineHeight = 14;
            return (
              <text
                key={axis.id}
                x={x.toFixed(2)}
                y={y.toFixed(2)}
                fontSize="12.5"
                fontWeight="700"
                textAnchor={anchor}
                dominantBaseline={lines.length > 1 ? undefined : 'middle'}
                className={styles.axisText}
              >
                {lines.length > 1 ? (
                  <>
                    <tspan x={x.toFixed(2)} dy={outwardIsUp ? -lineHeight : 0}>{lines[0]}</tspan>
                    <tspan x={x.toFixed(2)} dy={lineHeight}>{lines[1]}</tspan>
                  </>
                ) : axis.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
