'use client';

import radarData from '../data/radar.json';
import RadarChart from './RadarChart';
import CombinedRadarChart from './CombinedRadarChart';
import ScaleExplanation from './ScaleExplanation';
import styles from './RadarDiagrams.module.css';

type RawArch = typeof radarData.archetypes[number];

// Looks up an archetype's name by id
function getParentName(parentId: string) {
  return radarData.archetypes.find((a) => a.id === parentId)?.name ?? parentId;
}

// Groups archetypes into  parent/subtype families for display
export default function RadarDiagrams() {
  const standalone = radarData.archetypes.filter((a) => !('parentId' in a) || !a.parentId);
  const parents = standalone.filter((a) =>
    radarData.archetypes.some((b) => 'parentId' in b && b.parentId === a.id)
  );
  const trueStandalone = standalone.filter((a) => !parents.find((p) => p.id === a.id));

  return (
    <div className={styles.root}>
      <ScaleExplanation />

      <CombinedRadarChart archetypes={radarData.archetypes} axes={radarData.axes} />

      <div className={styles.sectionDivider}>
        <span className={styles.sectionLabel}>Arquetipos Individuales</span>
      </div>

      <div className={styles.standaloneGrid}>
        {trueStandalone.map((arch) => (
          <RadarChart key={arch.id} archetype={arch} axes={radarData.axes} />
        ))}
      </div>

      {parents.map((parent) => {
        const subtypes = radarData.archetypes.filter(
          (a) => 'parentId' in a && a.parentId === parent.id
        );
        return (
          <div key={parent.id} className={styles.group}>
            <div className={styles.groupHeader} style={{ borderLeftColor: parent.color }}>
              <span className={styles.groupLabel} style={{ color: parent.color }}>Familia</span>
              <span className={styles.groupName}>{parent.name}</span>
              <span className={styles.groupDesc}>
                Incluye {subtypes.length} subtipos: {subtypes.map((s) => s.name).join(' y ')}
              </span>
            </div>
            <div className={styles.groupGrid}>
              <RadarChart archetype={parent} axes={radarData.axes} />
              {subtypes.map((sub) => (
                <RadarChart
                  key={sub.id}
                  archetype={sub}
                  axes={radarData.axes}
                  subtypeOf={parent.name}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
