'use client';

import { useState } from 'react';
import styles from './ArchetypeCards.module.css';

const PALETTE = ['#c0762a', '#2563a8', '#6d3fb5', '#c0304a', '#1a7a55', '#4a5a72', '#0e7490'];

interface Example {
  name: string;
  description: string;
  justification: string;
  sources: string[];
}

interface Archetype {
  id: string;
  name: string;
  shortDescription: string;
  characteristics: string[];
  criteria: Record<string, string>;
  examples: Example[];
}

export default function ArchetypeCards({ archetypes }: { archetypes: Archetype[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className={styles.grid}>
      {archetypes.map((arch, i) => {
        const hex = PALETTE[i % PALETTE.length];
        const isOpen = expanded === arch.id;
        return (
          <div
            key={arch.id}
            onClick={() => setExpanded(isOpen ? null : arch.id)}
            className={styles.card}
          >
            <div
              className={styles.cardHeader}
              style={{ background: `linear-gradient(135deg, ${hex}18, ${hex}0e)`, borderBottom: `2px solid ${hex}40` }}
            >
              <div className={styles.cardHeaderTop}>
                <span className={styles.archetypeLabel} style={{ color: hex }}>
                  Arquetipo
                </span>
                <span className={styles.toggleIcon}>{isOpen ? '▲' : '▼'}</span>
              </div>
              <h2 className={styles.cardTitle}>{arch.name}</h2>
              <p className={styles.cardDesc}>{arch.shortDescription}</p>
            </div>

            <div className={styles.tags}>
              {arch.characteristics.map((c) => (
                <span
                  key={c}
                  className={styles.tag}
                  style={{ borderColor: hex + '50', color: hex, background: hex + '12' }}
                >
                  {c}
                </span>
              ))}
            </div>

            <div className={styles.criteria}>
              {Object.entries(arch.criteria).map(([k, v]) => (
                <span key={k} className={styles.criterionPill}>{v}</span>
              ))}
            </div>

            {isOpen && (
              <div className={styles.expanded}>
                <span className={styles.expandedSectionLabel}>Ejemplos</span>
                <div className={styles.examplesStack}>
                  {arch.examples.map((ex) => (
                    <div key={ex.name} className={styles.exampleCard}>
                      <p className={styles.exampleName}>{ex.name}</p>
                      <p className={styles.exampleDesc}>{ex.description}</p>
                      <p className={styles.exampleJustification}>{ex.justification}</p>
                      {ex.sources.length > 0 && (
                        <div className={styles.sourcesList}>
                          {ex.sources.map((s) => (
                            <span key={s} className={styles.source}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
