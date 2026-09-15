'use client';

import { useState } from 'react';
import styles from './HardwarePredictor.module.css';

const COUNTER_GROUPS = [
  {
    label: 'Instrucciones y Caché L1',
    counters: [
      { key: 'instructions',          label: 'instructions' },
      { key: 'L1-dcache-load-misses', label: 'L1-dcache-load-misses' },
      { key: 'L1-icache-load-misses', label: 'L1-icache-load-misses' },
    ],
  },
  {
    label: 'LLC y Predicción de Saltos',
    counters: [
      { key: 'LLC-loads',       label: 'LLC-loads' },
      { key: 'LLC-load-misses', label: 'LLC-load-misses' },
      { key: 'branch-misses',   label: 'branch-misses' },
    ],
  },
  {
    label: 'Saltos y dTLB',
    counters: [
      { key: 'branches',         label: 'branches' },
      { key: 'dTLB-loads',       label: 'dTLB-loads' },
      { key: 'dTLB-load-misses', label: 'dTLB-load-misses' },
    ],
  },
  {
    label: 'iTLB y Caché General',
    counters: [
      { key: 'iTLB-loads',       label: 'iTLB-loads' },
      { key: 'iTLB-load-misses', label: 'iTLB-load-misses' },
      { key: 'cache-misses',     label: 'cache-misses' },
    ],
  },
] as const;

type CounterKey =
  | 'instructions'
  | 'L1-dcache-load-misses'
  | 'L1-icache-load-misses'
  | 'LLC-loads'
  | 'LLC-load-misses'
  | 'branch-misses'
  | 'branches'
  | 'dTLB-loads'
  | 'dTLB-load-misses'
  | 'iTLB-loads'
  | 'iTLB-load-misses'
  | 'cache-misses';

type RawCounters = Record<CounterKey, string>;

const EMPTY_COUNTERS: RawCounters = {
  'instructions':          '',
  'L1-dcache-load-misses': '',
  'L1-icache-load-misses': '',
  'LLC-loads':             '',
  'LLC-load-misses':       '',
  'branch-misses':         '',
  'branches':              '',
  'dTLB-loads':            '',
  'dTLB-load-misses':      '',
  'iTLB-loads':            '',
  'iTLB-load-misses':      '',
  'cache-misses':          '',
};

const ARCHETYPE_COLORS: Record<string, string> = {
  'cpu-intensive':              '#3b82f6',
  'high-intensity-big-data-compute': '#0ea5e9',
  'memory-intensive':           '#8b5cf6',
  'latency-bound':              '#f59e0b',
  'bandwidth-bound':            '#10b981',
  'io-bound':                   '#ef4444',
};

const ARCHETYPE_NAMES: Record<string, string> = {
  'cpu-intensive':              'CPU Intensive',
  'high-intensity-big-data-compute': 'High-Intensity Big-Data Compute',
  'memory-intensive':           'Memory Intensive',
  'latency-bound':              'Latency Bound',
  'bandwidth-bound':            'Bandwidth Bound',
  'io-bound':                   'I/O Bound',
};

const CRITERIA_NAMES: Record<string, string> = {
  accessPattern:          'Patrón de Acceso',
  workingSet:             'Working Set',
  cacheBehavior:          'Comportamiento de Caché',
  computationalIntensity: 'Intensidad Computacional',
  parallelization:        'Paralelización',
};

interface DerivedMetrics {
  llcMissRate:    number | null;
  l1dMissRate:    number | null;
  l1iMissRate:    number | null;
  branchMissRate: number | null;
  dTLBMissRate:   number | null;
  iTLBMissRate:   number | null;
  instrPerLLCMiss: number | null;
}

interface ArchetypeScore {
  id:    string;
  score: number;
  pct:   number;
}

interface CriterionValue {
  id:    string;
  label: string;
}

interface PredictionResult {
  archetypeScores: ArchetypeScore[];
  criteriaValues:  Record<string, CriterionValue>;
  metrics:         DerivedMetrics;
}

// Safe division: returns null when the denominator is missing
function ratio(num: number, den: number): number | null {
  return den > 0 ? num / den : null;
}

function fmtPct(v: number | null): string {
  if (v === null) return 'N/A';
  return (v * 100).toFixed(2) + '%';
}

function fmtNum(v: number | null): string {
  if (v === null) return 'N/A';
  return v.toFixed(1);
}

// Scores each archetype and predicts each criteri from the perf  ratios
function predict(raw: RawCounters): PredictionResult {
  const n = (k: CounterKey) => {
    const v = parseFloat(raw[k]);
    return isNaN(v) ? 0 : v;
  };

  const instructions  = n('instructions');
  const l1dMisses     = n('L1-dcache-load-misses');
  const l1iMisses     = n('L1-icache-load-misses');
  const llcLoads      = n('LLC-loads');
  const llcMisses     = n('LLC-load-misses');
  const branchMisses  = n('branch-misses');
  const branches      = n('branches');
  const dTLBLoads     = n('dTLB-loads');
  const dTLBMisses    = n('dTLB-load-misses');
  const iTLBLoads     = n('iTLB-loads');
  const iTLBMisses    = n('iTLB-load-misses');
  const cacheMisses   = n('cache-misses');

  const llcMissRate    = ratio(llcMisses,   llcLoads);
  const l1dMissRate    = ratio(l1dMisses,   instructions);
  const l1iMissRate    = ratio(l1iMisses,   instructions);
  const branchMissRate = ratio(branchMisses, branches);
  const dTLBMissRate   = ratio(dTLBMisses,  dTLBLoads);
  const iTLBMissRate   = ratio(iTLBMisses,  iTLBLoads);
  const instrPerLLCMiss = ratio(instructions, llcMisses);

  const llcMR = llcMissRate    ?? 0;
  const l1dMR = l1dMissRate    ?? 0;
  const l1iMR = l1iMissRate    ?? 0;
  const brMR  = branchMissRate ?? 0;
  const dTMR  = dTLBMissRate   ?? 0;
  const iTMR  = iTLBMissRate   ?? 0;

  const scores: Record<string, number> = {
    'cpu-intensive':               0,
    'high-intensity-big-data-compute': 0,
    'memory-intensive':            0,
    'latency-bound':               0,
    'bandwidth-bound':             0,
    'io-bound':                    0,
  };

  if (llcMissRate !== null) {
    if (llcMR < 0.05)       scores['cpu-intensive'] += 4;
    else if (llcMR < 0.15)  scores['cpu-intensive'] += 2;
  }
  if (l1dMissRate !== null) {
    if (l1dMR < 0.01)       scores['cpu-intensive'] += 3;
    else if (l1dMR < 0.05)  scores['cpu-intensive'] += 1;
  }
  if (branchMissRate !== null) {
    if (brMR < 0.02)        scores['cpu-intensive'] += 2;
    else if (brMR < 0.05)   scores['cpu-intensive'] += 1;
  }
  if (dTLBMissRate !== null) {
    if (dTMR < 0.03)        scores['cpu-intensive'] += 1;
  }

  if (instrPerLLCMiss !== null) {
    if (instrPerLLCMiss > 5000)       scores['high-intensity-big-data-compute'] += 4;
    else if (instrPerLLCMiss > 1000)  scores['high-intensity-big-data-compute'] += 2;
  }
  if (llcLoads > 0 && instructions > 0) {
    const llcLoadRate = llcLoads / instructions;
    if (llcLoadRate > 0.05)           scores['high-intensity-big-data-compute'] += 3;
    else if (llcLoadRate > 0.01)      scores['high-intensity-big-data-compute'] += 1;
  }
  if (branchMissRate !== null) {
    if (brMR < 0.02)                  scores['high-intensity-big-data-compute'] += 2;
    else if (brMR < 0.05)             scores['high-intensity-big-data-compute'] += 1;
  }
  if (llcMissRate !== null) {
    if (llcMR > 0.05 && llcMR < 0.4) scores['high-intensity-big-data-compute'] += 2;
  }

  if (llcMissRate !== null) {
    if (llcMR > 0.3)        scores['memory-intensive'] += 4;
    else if (llcMR > 0.15)  scores['memory-intensive'] += 2;
    else if (llcMR > 0.05)  scores['memory-intensive'] += 1;
  }
  if (l1dMissRate !== null) {
    if (l1dMR > 0.1)        scores['memory-intensive'] += 4;
    else if (l1dMR > 0.05)  scores['memory-intensive'] += 2;
    else if (l1dMR > 0.02)  scores['memory-intensive'] += 1;
  }

  if (dTLBMissRate !== null) {
    if (dTMR > 0.15)        scores['latency-bound'] += 5;
    else if (dTMR > 0.08)   scores['latency-bound'] += 3;
    else if (dTMR > 0.03)   scores['latency-bound'] += 1;
  }
  if (llcMissRate !== null) {
    if (llcMR > 0.4)        scores['latency-bound'] += 4;
    else if (llcMR > 0.2)   scores['latency-bound'] += 2;
  }

  if (llcMissRate !== null) {
    if (llcMR > 0.2)        scores['bandwidth-bound'] += 3;
    else if (llcMR > 0.1)   scores['bandwidth-bound'] += 1;
  }
  if (dTLBMissRate !== null) {
    if (dTMR < 0.02)        scores['bandwidth-bound'] += 4;
    else if (dTMR < 0.05)   scores['bandwidth-bound'] += 2;
  }
  if (branchMissRate !== null) {
    if (brMR < 0.02)        scores['bandwidth-bound'] += 2;
  }
  if (l1dMissRate !== null && l1dMR > 0.02) {
    scores['bandwidth-bound'] += 1;
  }

  const memoryPressure = llcMR + l1dMR + brMR;
  if (memoryPressure < 0.05) {
    scores['io-bound'] += 4;
  }
  if (instructions > 0 && cacheMisses > 0 && cacheMisses / instructions < 0.001) {
    scores['io-bound'] += 2;
  }

  // Turn scores into percentages and rank archetypes by score
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const archetypeScores = Object.entries(scores)
    .map(([id, score]) => ({
      id,
      score,
      pct: total > 0 ? Math.round((score / total) * 100) : 0,
    }))
    .sort((a, b) => b.score - a.score);

  let accessPattern: CriterionValue;
  if (dTMR > 0.1 && llcMR > 0.25) {
    accessPattern = { id: 'traversal-punteros', label: 'Pointer Chasing' };
  } else if (dTMR > 0.05 || llcMR > 0.2) {
    accessPattern = { id: 'aleatorio', label: 'Aleatorio' };
  } else if (brMR < 0.02 && dTMR < 0.02 && llcMR > 0.1) {
    accessPattern = { id: 'streaming', label: 'Streaming' };
  } else if (brMR < 0.02 && dTMR < 0.02) {
    accessPattern = { id: 'por-bloques', label: 'Por Bloques' };
  } else {
    accessPattern = { id: 'secuencial', label: 'Secuencial' };
  }

  let workingSet: CriterionValue;
  if (llcMR > 0.3 || (l1dMR > 0.1 && llcMR > 0.1)) {
    workingSet = { id: 'grande', label: 'Grande (supera la RAM)' };
  } else if (llcMR > 0.1 || l1dMR > 0.05) {
    workingSet = { id: 'mediano', label: 'Mediano (en RAM)' };
  } else {
    workingSet = { id: 'pequeño', label: 'Pequeño (en caché)' };
  }

  const cacheBehavior: CriterionValue =
    llcMR > 0.2 || l1dMR > 0.05
      ? { id: 'no-amigable', label: 'Cache-Unfriendly' }
      : { id: 'amigable',    label: 'Cache-Friendly'   };

  let computationalIntensity: CriterionValue;
  const ipm = instrPerLLCMiss;
  if (ipm === null || ipm > 10000) {
    computationalIntensity = { id: 'muy-alta', label: 'Muy Alta (> 10 FLOP/byte)' };
  } else if (ipm > 1000) {
    computationalIntensity = { id: 'alta',     label: 'Alta (2–10 FLOP/byte)'     };
  } else if (ipm > 100) {
    computationalIntensity = { id: 'media',    label: 'Media (~1 FLOP/byte)'       };
  } else {
    computationalIntensity = { id: 'baja',     label: 'Baja (< 1 FLOP/byte)'      };
  }

  let parallelization: CriterionValue;
  if (brMR > 0.08 || iTMR > 0.05 || l1iMR > 0.01) {
    parallelization = { id: 'irregular',    label: 'Paralelismo Irregular' };
  } else if (dTMR < 0.02 && brMR < 0.02) {
    parallelization = { id: 'data-parallel', label: 'Data Parallel'        };
  } else if (brMR > 0.03) {
    parallelization = { id: 'task-parallel', label: 'Task Parallel'        };
  } else {
    parallelization = { id: 'secuencial',    label: 'Secuencial'           };
  }

  return {
    archetypeScores,
    criteriaValues: { accessPattern, workingSet, cacheBehavior, computationalIntensity, parallelization },
    metrics: { llcMissRate, l1dMissRate, l1iMissRate, branchMissRate, dTLBMissRate, iTLBMissRate, instrPerLLCMiss },
  };
}

// Form for perf counters plus the predicted archetype and criteri
export default function HardwarePredictor() {
  const [counters, setCounters] = useState<RawCounters>(EMPTY_COUNTERS);
  const [result, setResult]     = useState<PredictionResult | null>(null);
  const [error, setError]       = useState('');

  function handleChange(key: CounterKey, value: string) {
    setCounters(prev => ({ ...prev, [key]: value }));
  }

  function handlePredict() {
    const hasAny = Object.values(counters).some(v => v.trim() !== '');
    if (!hasAny) {
      setError('Introduce al menos un valor de contador hardware.');
      return;
    }
    const invalid = Object.entries(counters).find(
      ([, v]) => v.trim() !== '' && (isNaN(parseFloat(v)) || parseFloat(v) < 0),
    );
    if (invalid) {
      setError(`Valor no válido en "${invalid[0]}". Introduce un número no negativo.`);
      return;
    }
    setError('');
    setResult(predict(counters));
  }

  function handleReset() {
    setCounters(EMPTY_COUNTERS);
    setResult(null);
    setError('');
  }

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <h2 className={styles.introTitle}>Predictor de Arquetipos</h2>
        <p className={styles.introText}>
          Introduce los valores de los contadores hardware obtenidos con{' '}
          <code>perf stat</code> u otra herramienta de perfilado. El predictor
          calcula ratios derivados y estima el arquetipo de rendimiento y los
          criterios de clasificación más probables.
        </p>
      </div>

      <div className={styles.form}>
        {COUNTER_GROUPS.map(group => (
          <div key={group.label} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            <div className={styles.groupInputs}>
              {group.counters.map(({ key, label }) => (
                <label key={key} className={styles.field}>
                  <span className={styles.fieldLabel}>{label}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 1234567"
                    value={counters[key as CounterKey]}
                    onChange={e => handleChange(key as CounterKey, e.target.value)}
                    className={styles.input}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button onClick={handlePredict} className={styles.btnPrimary}>
            Predecir Arquetipo
          </button>
          <button onClick={handleReset} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>
      </div>

      {result && (
        <div className={styles.results}>
          <h3 className={styles.resultsTitle}>Resultados</h3>

          <div className={styles.resultsGrid}>
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Arquetipo predicho</h4>
              <div className={styles.scoreList}>
                {result.archetypeScores.map((a, i) => (
                  <div key={a.id} className={styles.scoreRow}>
                    <div className={styles.scoreLabel}>
                      <span
                        className={styles.scoreDot}
                        style={{ background: ARCHETYPE_COLORS[a.id] ?? '#888' }}
                      />
                      <span className={i === 0 ? styles.scoreLabelBold : ''}>
                        {ARCHETYPE_NAMES[a.id] ?? a.id}
                      </span>
                    </div>
                    <div className={styles.scoreBar}>
                      <div
                        className={styles.scoreBarFill}
                        style={{
                          width: `${a.pct}%`,
                          background: ARCHETYPE_COLORS[a.id] ?? '#888',
                        }}
                      />
                    </div>
                    <span className={styles.scorePct}>{a.pct}%</span>
                  </div>
                ))}
              </div>
              <p className={styles.cardNote}>
                Arquetipo dominante:{' '}
                <strong>{ARCHETYPE_NAMES[result.archetypeScores[0].id]}</strong>
              </p>
            </div>

            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Criterios predichos</h4>
              <dl className={styles.criteriaList}>
                {Object.entries(result.criteriaValues).map(([key, val]) => (
                  <div key={key} className={styles.criteriaRow}>
                    <dt className={styles.criteriaKey}>{CRITERIA_NAMES[key] ?? key}</dt>
                    <dd className={styles.criteriaVal}>{val.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className={styles.metricsCard}>
            <h4 className={styles.cardTitle}>Métricas derivadas</h4>
            <div className={styles.metricsGrid}>
              <MetricItem label="LLC Miss Rate"    value={fmtPct(result.metrics.llcMissRate)}    hint="LLC-load-misses / LLC-loads" />
              <MetricItem label="L1D Miss Rate"    value={fmtPct(result.metrics.l1dMissRate)}    hint="L1-dcache-load-misses / instructions" />
              <MetricItem label="L1I Miss Rate"    value={fmtPct(result.metrics.l1iMissRate)}    hint="L1-icache-load-misses / instructions" />
              <MetricItem label="Branch Miss Rate" value={fmtPct(result.metrics.branchMissRate)} hint="branch-misses / branches" />
              <MetricItem label="dTLB Miss Rate"   value={fmtPct(result.metrics.dTLBMissRate)}   hint="dTLB-load-misses / dTLB-loads" />
              <MetricItem label="iTLB Miss Rate"   value={fmtPct(result.metrics.iTLBMissRate)}   hint="iTLB-load-misses / iTLB-loads" />
              <MetricItem label="Instr / LLC Miss" value={fmtNum(result.metrics.instrPerLLCMiss)} hint="Proxy de intensidad computacional" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricItem({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className={styles.metricItem}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricHint}>{hint}</span>
    </div>
  );
}
