import { useStore } from 'zustand';
import styles from './App.module.css';
import { bootstrapLinks, bootstrapTitle } from './bootstrap';
import { foundationSmokeProjection } from './foundation';
import { bootstrapStore } from './store';

export function App() {
  const ready = useStore(bootstrapStore, (state) => state.ready);

  return (
    <main className={styles.frame}>
      <section className={styles.proclamation} aria-labelledby="bootstrap-title">
        <p className={styles.eyebrow}>A succession crisis awaits</p>
        <h1 id="bootstrap-title">{bootstrapTitle}</h1>
        <p className={styles.decree}>
          The deterministic kernel, canonical court of {foundationSmokeProjection.lordNames.length}{' '}
          lords, and {foundationSmokeProjection.territoryNames.length}-territory registry are
          linked.
        </p>
        <p className={styles.status} role="status">
          {ready
            ? `Foundation ${foundationSmokeProjection.buildVersion} ready · ${foundationSmokeProjection.contentHash}`
            : 'Preparing the integrated foundation.'}
        </p>
        <nav aria-label="Project source documents">
          <ul className={styles.links}>
            {bootstrapLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </main>
  );
}
