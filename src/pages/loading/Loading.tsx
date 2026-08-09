import styles from './Loading.module.css';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message }: LoadingProps) {
  return (
    <div className={styles.container}>
      {/* Contêiner da Animação */}
      <div className={styles.animationWrapper}>
        <div className={styles.pingCircle}></div>
        <div className={styles.spinRing}></div>
        <div className={styles.centerDot}></div>
      </div>

      {/* Textos */}
      <h1 className={styles.title}>
        PGI <span className={styles.titleHighlight}>PROA</span>
      </h1>
      <p className={styles.subtitle}>
        {message ||
          'Não tem nada carregando, é apenas uma tela de carregamento...'}
      </p>
    </div>
  );
}
