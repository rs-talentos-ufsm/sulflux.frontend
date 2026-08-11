import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Login.module.css';
import { Navigate } from 'react-router-dom';
import { useLogin } from '../../../hooks/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { AuthEnums } from '@lib/shared';

interface LoginProps {
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
}

// export default function LoginPage({ onNavigateToRegister, onNavigateToForgot }: LoginProps) {
export default function LoginPage({ onNavigateToRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: login, isPending, isError, error } = useLogin();
  const status = useAuthStore((state) => state.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  if (status === AuthEnums.LoginStatus.Authenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Bem-vindo de volta</h2>
        <p className={styles.subtitle}>
          Insira seu e-mail e senha para acessar sua conta.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="usuario@acad.com"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Senha
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className={styles.optionsRow}>
          <div className={styles.rememberMe}>
            {/* <input type="checkbox" id="remember" className={styles.checkbox} /> */}
            {/* <label htmlFor="remember">Lembrar de mim</label> */}
          </div>
          {/* <button type="button" className={styles.forgotLink} onClick={onNavigateToForgot}>
            Esqueceu sua senha?
          </button> */}
        </div>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={isPending}
        >
          {isPending ? 'Entrando' : 'Entrar'}
        </button>
        {isError && (
          <p style={{ color: 'red' }}>
            {/* @ts-ignore */}
            Erro: {error?.response?.data?.error || 'Credenciais inválidas'}
          </p>
        )}
        {/* <div className={styles.divider}>
          <span>Ou entre com</span>
        </div>

        <div className={styles.socialGrid}>
          <button type="button" className={styles.socialButton}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button type="button" className={styles.socialButton}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-.96 3.64-.82 1.57.06 2.75.63 3.54 1.51-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Apple
          </button>
        </div> */}

        <p className={styles.footerText}>
          Não tem uma conta?{' '}
          <button
            type="button"
            className={styles.switchMode}
            onClick={onNavigateToRegister}
          >
            Registre-se agora.
          </button>
        </p>
      </form>
    </div>
  );
}
