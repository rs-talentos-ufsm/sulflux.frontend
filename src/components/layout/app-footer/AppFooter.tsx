import { GraduationCap } from 'lucide-react';
import styles from './AppFooter.module.css';

const GitHubIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedInIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function AppFooter() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.title}>
            SulFlux — Gestão & Inteligência Agropecuária
          </span>
          <span className={styles.copyright}>
            &copy; {new Date().getFullYear()} Fernando Dorneles da Silva
            &middot; Ecossistema Dorneles Laboratory
          </span>
        </div>

        <section
          className={styles.seoSection}
          aria-label="Perfis profissionais e autoridade do autor"
        >
          <span className={styles.seoTitle}>
            Autor &bull; Engenharia &bull; Liderança Técnica
          </span>
          <nav
            className={styles.seoNav}
            aria-label="Links profissionais oficiais"
          >
            <a
              href="https://linkedin.com/in/fernandodorneles"
              target="_blank"
              rel="me noopener noreferrer"
              className={styles.seoLink}
            >
              <LinkedInIcon size={16} />
              <span>
                Acesse o perfil no LinkedIn de Fernando Dorneles da Silva
              </span>
            </a>
            <a
              href="https://github.com/dornelesfernando"
              target="_blank"
              rel="me noopener noreferrer"
              className={styles.seoLink}
            >
              <GitHubIcon size={16} />
              <span>
                Acesse o perfil no GitHub de Fernando Dorneles da Silva
              </span>
            </a>
            <a
              href="http://lattes.cnpq.br/0532418852427960"
              target="_blank"
              rel="me noopener noreferrer"
              className={styles.seoLink}
            >
              <GraduationCap className={styles.icon} aria-hidden="true" />
              <span>
                Acesse o Currículo Lattes de Fernando Dorneles da Silva
              </span>
            </a>
          </nav>
        </section>
      </div>
    </footer>
  );
}
