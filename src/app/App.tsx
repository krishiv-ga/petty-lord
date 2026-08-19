import { useStore } from 'zustand';
import styles from './App.module.css';
import { bootstrapLinks, bootstrapTitle } from './bootstrap';
import { bootstrapStore } from './store';

export function App() {
  const ready = useStore(bootstrapStore, (state) => state.ready);

  return (
    <main className={styles.frame}>
      <section className={styles.proclamation} aria-labelledby="bootstrap-title">
        <p className={styles.eyebrow}>A succession crisis awaits</p>
        <h1 id="bootstrap-title">{bootstrapTitle}</h1>
        <p className={styles.decree}>
          The design is locked. The deterministic court, its rivals, and the royal map arrive in the
          next work packets.
        </p>
        <p className={styles.status} role="status">
          {ready ? 'Repository foundation ready.' : 'Preparing the repository foundation.'}
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
