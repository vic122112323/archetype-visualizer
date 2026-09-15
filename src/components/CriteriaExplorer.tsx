'use client';

import { useState } from 'react';
import data from '../data/data.json';
import styles from './CriteriaExplorer.module.css';

type Criterion = typeof data.criteria[number];
type CriterionValue = Criterion['values'][number];

const EXTRA_FIELD_LABELS: Record<string, string> = {
  rooflineRegime: 'Régimen Roofline',
  expectedBottleneck: 'Cuello de botella esperado',
  expectedSpeedup: 'Aceleración esperada',
  synchronizationOverhead: 'Sobrecarga de sincronización',
  loadBalance: 'Balance de carga',
};

const EXTRA_FIELD_KEYS = Object.keys(EXTRA_FIELD_LABELS);

const archetypeNames: Record<string, string> = Object.fromEntries(
  data.archetypes.map((a) => [a.id, a.name])
);

type Selection =
  | { type: 'criterion'; criterionId: string }
  | { type: 'value'; criterionId: string; valueId: string };

// Lists criteri and their values, with a detail view for each
export default function CriteriaExplorer() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Selection | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectCriterion(criterionId: string) {
    setExpanded((prev) => new Set(Array.from(prev).concat(criterionId)));
    setSelected({ type: 'criterion', criterionId });
    setShowDetail(true);
  }

  function selectValue(criterionId: string, valueId: string) {
    setSelected({ type: 'value', criterionId, valueId });
    setShowDetail(true);
  }

  function back() {
    setShowDetail(false);
  }

  const selectedCriterion =
    selected
      ? data.criteria.find((c) => c.id === selected.criterionId) ?? null
      : null;
  const selectedValue =
    selected?.type === 'value' && selectedCriterion
      ? selectedCriterion.values.find((v) => v.id === selected.valueId) ?? null
      : null;

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.sidebar} ${showDetail ? styles.sidebarHiddenMobile : ''}`}
      >
        <div className={styles.sidebarTop}>
          <p className={styles.sidebarCount}>
            {data.criteria.length} categorías de criterio
          </p>
        </div>
        <nav className={styles.nav}>
          {data.criteria.map((criterion) => {
            const isOpen = expanded.has(criterion.id);
            const isCriterionActive =
              selected?.criterionId === criterion.id;
            return (
              <div key={criterion.id} className={styles.criterionGroup}>
                <div className={styles.criterionRow}>
                  <button
                    className={`${styles.criterionBtn} ${isCriterionActive && selected?.type === 'criterion' ? styles.criterionBtnActive : ''}`}
                    onClick={() => selectCriterion(criterion.id)}
                    style={
                      isCriterionActive
                        ? { borderLeftColor: criterion.color }
                        : undefined
                    }
                  >
                    <span className={styles.criterionDot} style={{ background: criterion.color }} />
                    <span className={styles.criterionName}>{criterion.name}</span>
                  </button>
                  <button
                    className={styles.expandBtn}
                    onClick={() => toggleExpand(criterion.id)}
                    aria-label={isOpen ? 'Colapsar' : 'Expandir'}
                  >
                    {isOpen ? '▲' : '▼'}
                  </button>
                </div>

                {isOpen && (
                  <div className={styles.valuesList}>
                    {criterion.values.map((v) => {
                      const isValueActive =
                        selected?.type === 'value' &&
                        selected.criterionId === criterion.id &&
                        selected.valueId === v.id;
                      return (
                        <button
                          key={v.id}
                          className={`${styles.valueBtn} ${isValueActive ? styles.valueBtnActive : ''}`}
                          onClick={() => selectValue(criterion.id, v.id)}
                          style={isValueActive ? { color: criterion.color } : undefined}
                        >
                          <span
                            className={styles.valueBullet}
                            style={{ background: isValueActive ? criterion.color : undefined }}
                          />
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <section
        className={`${styles.content} ${!showDetail ? styles.contentHiddenMobile : ''}`}
      >
        {showDetail && (
          <button className={styles.backBtn} onClick={back}>
            ← Volver a la lista
          </button>
        )}

        {!selected ? (
          <IntroPanel />
        ) : selected.type === 'criterion' && selectedCriterion && !selectedValue ? (
          <CriterionDetail criterion={selectedCriterion} onSelectValue={selectValue} />
        ) : selectedCriterion && selectedValue ? (
          <ValueDetail
            criterion={selectedCriterion}
            value={selectedValue}
            onBack={() => selectCriterion(selectedCriterion.id)}
          />
        ) : null}
      </section>
    </div>
  );
}

// Default view before a criteri is selected
function IntroPanel() {
  return (
    <div className={styles.intro}>
      <h2 className={styles.introTitle}>Sistema de Criterios de Clasificación</h2>
      <p className={styles.introText}>
        Los <strong>criterios de clasificación</strong> son las dimensiones que se utilizan para
        caracterizar el comportamiento de cada arquetipo de rendimiento. Cada criterio describe un
        aspecto clave del comportamiento computacional de una aplicación.
      </p>
      <p className={styles.introText}>
        El sistema se organiza en <strong>{data.criteria.length} categorías</strong>, cada una con
        un conjunto de valores discretos que permiten clasificar cualquier aplicación de forma
        precisa. Los valores de cada criterio están diseñados para ser mutuamente excluyentes y
        colectivamente exhaustivos dentro de su dimensión.
      </p>
      <p className={styles.introText}>
        La combinación de valores en todos los criterios define de forma única el perfil de
        rendimiento de una aplicación y determina su arquetipo correspondiente.
      </p>
      <div className={styles.introHint}>
        Selecciona una categoría en el panel izquierdo para explorar sus valores y su relación con
        los arquetipos.
      </div>
    </div>
  );
}

// Overview of a single criteri and its possible values
function CriterionDetail({
  criterion,
  onSelectValue,
}: {
  criterion: Criterion;
  onSelectValue: (criterionId: string, valueId: string) => void;
}) {
  return (
    <article className={styles.detail}>
      <header className={styles.detailHeader} style={{ borderTopColor: criterion.color }}>
        <p className={styles.detailCategory}>Categoría de criterio</p>
        <h2 className={styles.detailTitle}>{criterion.name}</h2>
        <p className={styles.detailLead}>{criterion.description}</p>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Valores posibles</h3>
        <div className={styles.valuesOverview}>
          {criterion.values.map((v) => (
            <button
              key={v.id}
              className={styles.valueOverviewCard}
              onClick={() => onSelectValue(criterion.id, v.id)}
              style={{ borderTopColor: criterion.color }}
            >
              <span className={styles.valueOverviewLabel}>{v.label}</span>
              <span className={styles.valueOverviewDesc}>{v.description}</span>
              {v.relatedArchetypes.length > 0 && (
                <span className={styles.valueOverviewArchetypes}>
                  Arquetipos:{' '}
                  {v.relatedArchetypes
                    .map((id) => archetypeNames[id] ?? id)
                    .join(', ')}
                </span>
              )}
              <span className={styles.valueOverviewCta}>Ver detalles →</span>
            </button>
          ))}
        </div>
      </section>
    </article>
  );
}

// Detail view for a single value of a criteri
function ValueDetail({
  criterion,
  value,
  onBack,
}: {
  criterion: Criterion;
  value: CriterionValue;
  onBack: () => void;
}) {
  const extra = value as Record<string, unknown>;
  const extraFields = EXTRA_FIELD_KEYS.filter(
    (k) => k in extra && extra[k] !== undefined
  );

  return (
    <article className={styles.detail}>
      <header className={styles.detailHeader} style={{ borderTopColor: criterion.color }}>
        <button className={styles.breadcrumb} onClick={onBack}>
          ← {criterion.name}
        </button>
        <h2 className={styles.detailTitle}>{value.label}</h2>
        <p className={styles.detailLead}>{value.description}</p>
      </header>

      {'characteristics' in value && value.characteristics && value.characteristics.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Características</h3>
          <ul className={styles.charList}>
            {value.characteristics.map((c, i) => (
              <li key={i} className={styles.charItem}>
                <span className={styles.charBullet} style={{ color: criterion.color }}>—</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {extraFields.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Información Técnica</h3>
          <dl className={styles.dl}>
            {extraFields.map((k) => (
              <div key={k} className={styles.dlRow}>
                <dt className={styles.dlKey}>{EXTRA_FIELD_LABELS[k]}</dt>
                <dd className={styles.dlVal}>{String(extra[k])}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {'example' in value && value.example && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Ejemplo</h3>
          <div className={styles.exCard}>
            <h4 className={styles.exName}>{value.example as string}</h4>
            {'justification' in value && value.justification && (
              <p className={styles.exJustification}>{value.justification as string}</p>
            )}
          </div>
        </section>
      )}

      {'sources' in value && value.sources && (value.sources as string[]).length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Fuentes</h3>
          <ul className={styles.sourcesList}>
            {(value.sources as string[]).map((s, i) => (
              <li key={i} className={styles.sourceItem}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {value.relatedArchetypes.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Arquetipos Relacionados</h3>
          <div className={styles.relatedChips}>
            {value.relatedArchetypes.map((id) => (
              <span
                key={id}
                className={styles.chip}
                style={{
                  borderColor: criterion.color + '60',
                  color: criterion.color,
                  background: criterion.color + '12',
                }}
              >
                {archetypeNames[id] ?? id}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
