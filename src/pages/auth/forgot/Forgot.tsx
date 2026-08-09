import { ArrowLeft } from 'lucide-react';
import styles from './Forgot.module.css';

interface ForgotProps {
  onNavigateToLogin: () => void;
}

export default function ForgotPage({ onNavigateToLogin }: ForgotProps) {
  return (
    <div className={styles.wrapper}>
      {/* Botão de Voltar absoluto no canto superior esquerdo (como no original) */}
      <button
        className={styles.backButton}
        onClick={onNavigateToLogin}
        aria-label="Voltar para o login"
      >
        <ArrowLeft size={16} />
      </button>

      <div className={styles.header}>
        <h2 className={styles.title}>Redefinir Senha</h2>
        <p className={styles.subtitle}>
          Insira seu endereço de e-mail e enviaremos um link de redefinição.
        </p>
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="usuario@acad.com"
            className={styles.input}
          />
        </div>

        <button type="submit" className={styles.primaryButton}>
          Enviar Link de Redefinição
        </button>

        <p className={styles.footerText}>
          Lembrou sua senha?{' '}
          <button
            type="button"
            className={styles.switchMode}
            onClick={onNavigateToLogin}
          >
            Voltar para o Login.
          </button>
        </p>
      </form>
    </div>
  );
}
