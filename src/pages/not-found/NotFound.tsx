import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import styles from './NotFound.module.css';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <FileQuestion size={48} />
        </div>

        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Página Não Encontrada</h2>

        <p className={styles.description}>
          Ops! A página que você está procurando não existe, foi movida ou você
          não tem permissão para acessá-la.
        </p>

        <div className={styles.buttonGroup}>
          <button onClick={handleGoBack} className={styles.secondaryButton}>
            <ArrowLeft size={18} />
            Voltar
          </button>

          <button onClick={handleGoHome} className={styles.primaryButton}>
            <Home size={18} />
            Ir para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
