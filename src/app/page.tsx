'use client';

import { useState } from 'react';
import ArchetypeExplorer from '../components/ArchetypeExplorer';
import CriteriaExplorer from '../components/CriteriaExplorer';
import RadarDiagrams from '../components/RadarDiagrams';
import HardwarePredictor from '../components/HardwarePredictor';
import styles from './page.module.css';

type Tab = 'archetypes' | 'criteria' | 'diagrams' | 'predictor';

const TABS: { id: Tab; label: string }[] = [
  { id: 'archetypes', label: 'Arquetipos' },
  { id: 'criteria',   label: 'Criterios'  },
  { id: 'diagrams',   label: 'Diagramas'  },
  { id: 'predictor',  label: 'Predictor'  },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('archetypes');

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.siteTitle}>Visualizador de Arquetipos</span>
          <nav className={styles.nav}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`${styles.navBtn} ${tab === t.id ? styles.navBtnActive : ''}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {tab === 'archetypes' && <ArchetypeExplorer />}
        {tab === 'criteria'   && <CriteriaExplorer />}
        {tab === 'diagrams'   && <RadarDiagrams />}
        {tab === 'predictor'  && <HardwarePredictor />}
      </main>

      <footer className={styles.footer}>
        Visualizador de Arquetipos — Proyecto TFG
      </footer>
    </div>
  );
}
