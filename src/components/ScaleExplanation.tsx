'use client';

import { useState } from 'react';
import radarData from '../data/radar.json';
import styles from './ScaleExplanation.module.css';

const AXIS_DESCRIPTIONS: Record<string, string> = {
  working_set:
    'Tamaño del conjunto de datos que la aplicación necesita mantener accesible en memoria durante su ejecución.',
  cache_impact:
    'Grado en que los patrones de acceso aprovechan o degradan la eficacia de la jerarquía de caché del procesador.',
  memory_patterns:
    'Organización y regularidad con la que la aplicación accede a las posiciones de memoria principal.',
  parallelism:
    'Capacidad del algoritmo para explotar recursos hardware paralelos: núcleos, SIMD o vectorización.',
  compute_intensity:
    'Número de operaciones aritméticas por byte transferido desde memoria (FLOP/byte). Métrica central del modelo Roofline.',
};

// Helper legend explaining what each radar axis means
export default function ScaleExplanation() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.card}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className={styles.toggleTextGroup}>
          <span className={styles.toggleTitle}>
            Guía de interpretación de los diagramas
          </span>
          <span className={styles.toggleHint}>
            {open ? 'Toca para ocultar' : 'Toca para desplegar y ver el detalle de cada eje'}
          </span>
        </div>
        <span className={styles.toggleIconWrap}>
          <span className={styles.toggleIcon}>▼</span>
        </span>
      </button>

      {open && (
        <div className={styles.body}>
          <p className={styles.intro}>
            Cada eje del diagrama radial representa un criterio de clasificación. Los valores están
            normalizados entre <strong>0 y 100</strong>. Las marcas del diagrama indican los niveles
            25, 50, 75 y 100. Cuanto mayor es el área del polígono, mayor es la presión sobre ese
            recurso o dimensión.
          </p>
          <div className={styles.axesGrid}>
            {radarData.axes.map((axis) => (
              <div key={axis.id} className={styles.axisCard}>
                <h4 className={styles.axisName}>{axis.label}</h4>
                <p className={styles.axisDesc}>{AXIS_DESCRIPTIONS[axis.id]}</p>
                <div className={styles.levels}>
                  {axis.levels.map((lv) => (
                    <div key={lv.value} className={styles.levelRow}>
                      <span className={styles.levelNum}>{lv.value}</span>
                      <div className={styles.levelBarTrack}>
                        <div
                          className={styles.levelBarFill}
                          style={{ width: lv.value === 0 ? '2px' : `${lv.value}%` }}
                        />
                      </div>
                      <span className={styles.levelLabel}>{lv.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
