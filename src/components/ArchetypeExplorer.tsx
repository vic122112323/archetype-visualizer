'use client';

import { useState, useMemo } from 'react';
import data from '../data/data.json';
import radarData from '../data/radar.json';
import RadarChart from './RadarChart';
import styles from './ArchetypeExplorer.module.css';

type Archetype = typeof data.archetypes[number];

const CRITERION_LABELS: Record<string, string> = {
  accessPattern: 'Patrón de acceso a memoria',
  workingSet: 'Working Set',
  cacheBehavior: 'Comportamiento en caché',
  computationalIntensity: 'Intensidad computacional',
  operationsType: 'Tipo de operaciones',
  parallelization: 'Potencial de paralelización',
  limitation: 'Limitación principal',
};

const ARCH_REC_LABELS: Record<string, string> = {
  cpuArchitecture: 'CPU',
  memory: 'Memoria',
  accelerators: 'Aceleradores',
};

// Derive subtype relationships from radar.json
const subtypeParents: Record<string, string> = {};
radarData.archetypes.forEach((a) => {
  if ('parentId' in a && a.parentId) {
    const parent = radarData.archetypes.find((p) => p.id === a.parentId);
    if (parent) subtypeParents[a.id] = parent.name;
  }
});

const archRecMap = data.relationships.architectureRecommendations as Record<
  string,
  Record<string, string>
>;

export default function ArchetypeExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.archetypes;
    return data.archetypes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q)
    );
  }, [query]);

  const selected = selectedId
    ? data.archetypes.find((a) => a.id === selectedId) ?? null
    : null;
  const radarArch = selectedId
    ? radarData.archetypes.find((a) => a.id === selectedId) ?? null
    : null;
  const archRec = selectedId ? archRecMap[selectedId] ?? null : null;

  function select(id: string) {
    setSelectedId(id);
    setShowDetail(true);
  }

  function back() {
    setShowDetail(false);
  }

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside
        className={`${styles.sidebar} ${showDetail ? styles.sidebarHiddenMobile : ''}`}
      >
        <div className={styles.sidebarTop}>
          <p className={styles.sidebarCount}>
            {data.archetypes.length} arquetipos disponibles
          </p>
          <input
            type="search"
            className={styles.search}
            placeholder="Buscar arquetipo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar arquetipo"
          />
        </div>
        <nav className={styles.nav}>
          {filtered.map((arch) => {
            const isSubtype = !!subtypeParents[arch.id];
            const active = selectedId === arch.id;
            return (
              <button
                key={arch.id}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''} ${isSubtype ? styles.navItemSubtype : ''}`}
                onClick={() => select(arch.id)}
              >
                {isSubtype && <span className={styles.subtypeIndent} />}
                <span className={styles.navItemInner}>
                  <span className={styles.navItemName}>{arch.name}</span>
                  {isSubtype && (
                    <span className={styles.navItemMeta}>
                      Subtipo de {subtypeParents[arch.id]}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className={styles.noResults}>Sin resultados para "{query}"</p>
          )}
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
        ) : (
          <ArchetypeDetail
            archetype={selected}
            radarArch={radarArch}
            archRec={archRec}
          />
        )}
      </section>
    </div>
  );
}

function IntroPanel() {
  return (
    <div className={styles.intro}>
      <h2 className={styles.introTitle}>¿Qué son los Arquetipos de Rendimiento?</h2>
      <p className={styles.introText}>
        Los <strong>arquetipos de rendimiento</strong> son categorías que describen el
        comportamiento computacional de una aplicación en función de sus patrones de acceso a
        memoria, intensidad aritmética y características de paralelismo.
      </p>
      <p className={styles.introText}>
        Identificar el arquetipo de una aplicación permite seleccionar la arquitectura hardware más
        adecuada y aplicar las optimizaciones con mayor impacto potencial. Esta clasificación se
        basa en varios conocidos modelos como
        en el <strong>modelo Roofline</strong> (Williams et al., 2009).
      </p>
      <p className={styles.introText}>
        Existen dos categorías principales de limitación: <strong>limitado por cómputo</strong>
        , cuando el procesador es el cuello de botella, y{' '}
        <strong>limitado por memoria</strong>, cuando la velocidad o el ancho de banda de acceso
        a datos restringe el rendimiento. Dentro de la limitación por memoria se distinguen
        subtipos según el patrón de acceso y la localidad de los datos.
      </p>
      <div className={styles.introHint}>
        Selecciona un arquetipo en el panel izquierdo para ver su perfil completo.
      </div>
    </div>
  );
}

/* ── Detail view ── */
function ArchetypeDetail({
  archetype,
  radarArch,
  archRec,
}: {
  archetype: Archetype;
  radarArch: typeof radarData.archetypes[number] | null;
  archRec: Record<string, string> | null;
}) {
  const isSubtype = !!subtypeParents[archetype.id];

  return (
    <article className={styles.detail}>
      {/* Header */}
      <header className={styles.detailHeader}>
        {isSubtype && (
          <span className={styles.subtypeTag}>
            Subtipo de {subtypeParents[archetype.id]}
          </span>
        )}
        <h2 className={styles.detailTitle}>{archetype.name}</h2>
        <p className={styles.detailLead}>{archetype.shortDescription}</p>
      </header>

      {/* Two-column body: left info + right radar */}
      <div className={styles.detailBody}>
        <div className={styles.detailLeft}>
          {/* Characteristics */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Características</h3>
            <ul className={styles.charList}>
              {archetype.characteristics.map((c, i) => (
                <li key={i} className={styles.charItem}>
                  <span className={styles.charBullet}>—</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Classification criteria */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Criterios de Clasificación</h3>
            <dl className={styles.dl}>
              {Object.entries(archetype.criteria).map(([key, val]) => (
                <div key={key} className={styles.dlRow}>
                  <dt className={styles.dlKey}>{CRITERION_LABELS[key] ?? key}</dt>
                  <dd className={styles.dlVal}>{val}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Architecture recommendations */}
          {archRec && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Recomendaciones de Arquitectura</h3>
              <dl className={styles.dl}>
                {Object.entries(archRec).map(([k, v]) => (
                  <div key={k} className={styles.dlRow}>
                    <dt className={styles.dlKey}>{ARCH_REC_LABELS[k] ?? k}</dt>
                    <dd className={styles.dlVal}>{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        {/* Radar chart */}
        {radarArch && (
          <div className={styles.detailRight}>
            <h3 className={styles.sectionTitle}>Perfil Radial</h3>
            <div className={styles.radarWrapper}>
              <RadarChart archetype={radarArch} axes={radarData.axes} />
            </div>
          </div>
        )}
      </div>

      {/* Examples */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ejemplos Representativos</h3>
        <div className={styles.examples}>
          {archetype.examples.map((ex, i) => (
            <div key={i} className={styles.exCard}>
              <h4 className={styles.exName}>{ex.name}</h4>
              <p className={styles.exDesc}>{ex.description}</p>
              {ex.justification && (
                <p className={styles.exJustification}>{ex.justification}</p>
              )}
              {ex.sources.length > 0 && (
                <div className={styles.exSources}>
                  <span className={styles.sourcesLabel}>Fuentes:</span>
                  <ul className={styles.sourcesList}>
                    {ex.sources.map((s, j) => (
                      <li key={j} className={styles.sourceItem}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
