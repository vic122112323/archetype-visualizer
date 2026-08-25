'use client';

import { useState } from 'react';
import styles from './CriteriaGrid.module.css';

const PALETTE = ['#c0762a', '#2563a8', '#6d3fb5', '#c0304a', '#1a7a55', '#4a5a72', '#0e7490'];

interface CriterionValue {
  id: string;
  label: string;
  description: string;
  characteristics?: string[];
  example?: string;
  justification?: string;
  sources?: string[];
  relatedArchetypes: string[];
  [key: string]: unknown;
}

interface Criterion {
  id: string;
  name: string;
  description: string;
  color: string;
  values: CriterionValue[];
}

interface Archetype {
  id: string;
  name: string;
}

export default function CriteriaGrid({
  criteria,
  archetypes,
}: {
  criteria: Criterion[];
  archetypes: Archetype[];
}) {
  const [open, setOpen] = useState<string | null>(null);

  const colorMap: Record<string, string> = {};
  archetypes.forEach((a, i) => { colorMap[a.id] = PALETTE[i % PALETTE.length]; });

  return (
    <div className={styles.grid}>
      {criteria.map((c) => (
        <div key={c.id} className={styles.card}>
          <h3 className={styles.cardTitle}>{c.name}</h3>
          <p className={styles.cardDesc}>{c.description}</p>

          <div className={styles.valuesWrapper}>
            {c.values.map((v) => {
              const key = `${c.id}-${v.id}`;
              const isOpen = open === key;
              return (
                <div key={v.id}>
                  <button
                    onClick={() => setOpen(isOpen ? null : key)}
                    className={styles.valueBtn}
                    style={{
                      borderColor: c.color + '60',
                      color: c.color,
                      background: isOpen ? c.color + '22' : c.color + '0e',
                    }}
                  >
                    {v.label}
                  </button>

                  {isOpen && (
                    <div
                      className={styles.detail}
                      style={{ borderColor: c.color + '30', background: c.color + '07' }}
                    >
                      <p className={styles.detailDescription}>{v.description}</p>

                      {v.characteristics && v.characteristics.length > 0 && (
                        <div>
                          <span className={styles.sectionLabel}>Características</span>
                          <ul className={styles.characteristicsList}>
                            {v.characteristics.map((ch) => (
                              <li key={ch} className={styles.characteristicItem}>
                                <span className={styles.bullet} style={{ color: c.color }}>—</span>
                                <span>{ch}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {v.example && (
                        <div className={styles.exampleSection}>
                          <span className={styles.sectionLabel}>Ejemplo</span>
                          <p className={styles.exampleName}>{v.example}</p>
                          {v.justification && (
                            <p className={styles.exampleJustification}>{v.justification}</p>
                          )}
                        </div>
                      )}

                      {v.sources && v.sources.length > 0 && (
                        <div>
                          <span className={styles.sectionLabel}>Fuentes</span>
                          <ul className={styles.sourcesList}>
                            {v.sources.map((s) => (
                              <li key={s} className={styles.sourceItem}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {v.relatedArchetypes.length > 0 && (
                        <div>
                          <span className={styles.sectionLabel}>Arquetipos relacionados</span>
                          <div className={styles.relatedSection}>
                            {v.relatedArchetypes.map((aid) => {
                              const arch = archetypes.find((a) => a.id === aid);
                              if (!arch) return null;
                              const color = colorMap[aid] ?? '#4a5a72';
                              return (
                                <span
                                  key={aid}
                                  className={styles.relatedPill}
                                  style={{ background: color + '18', color, borderColor: color + '45' }}
                                >
                                  {arch.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
