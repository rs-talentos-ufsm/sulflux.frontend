import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import styles from './Register.module.css';
import { useRegister, useLogin } from '../../../hooks/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { AuthEnums } from '@lib/shared';
import { PasswordStrengthMeter } from '@/components/utils/password-strength-metter/password-strength-meter';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export default function RegisterPage({ onNavigateToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const { mutate: register, isPending, isError, error } = useRegister();
  const { mutate: login } = useLogin();
  const status = useAuthStore((state) => state.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    register(
      { name, email, password },
      {
        onSuccess: () => {
          login({ email, password });
        },
      },
    );
  };

  if (status === AuthEnums.LoginStatus.Authenticated) {
    return <Navigate to="/" replace />;
  }

  // Tipagem segura do erro do Axios para remover o @ts-ignore
  const getErrorMessage = () => {
    if (!error) return null;
    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
      errors?: any;
    }>;
    // Tenta pegar a mensagem de erro da API (dependendo de como o seu backend formata)
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      'Erro ao criar conta. Tente novamente.'
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Criar Conta</h2>
        <p className={styles.subtitle}>
          Crie uma nova conta para começar no Sulflux.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            placeholder="Fulano de Tal"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required // Evita envio em branco
            disabled={isPending}
          />
        </div>

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
            required // Evita envio em branco
            disabled={isPending}
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
              placeholder="Crie uma senha"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // Evita envio em branco
              disabled={isPending}
            />

            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <PasswordStrengthMeter
            password={password}
            onValidityChange={setIsPasswordValid}
          />
        </div>

        {/* <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirmar Senha</label>
          <div className={styles.passwordWrapper}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme a senha"
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div> */}

        <button
          type="submit"
          className={`${styles.primaryButton} ${isPending || !isPasswordValid || !name || !email || !password ? styles.disabledButton : ''}`}
          disabled={
            isPending || !isPasswordValid || !name || !email || !password
          }
        >
          {isPending ? 'Criando Conta...' : 'Criar Conta'}
        </button>

        {isError && (
          <p
            style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}
          >
            {getErrorMessage()}
          </p>
        )}

        {/* <div className={styles.divider}>
          <span>Ou cadastre-se com</span>
        </div>

        <div className={styles.socialGrid}>
          ... código comentado dos botões sociais ...
        </div> */}

        <p className={styles.footerText}>
          Já tem uma conta?{' '}
          <button
            type="button"
            className={styles.switchMode}
            onClick={onNavigateToLogin}
            disabled={isPending}
          >
            Entre.
          </button>
        </p>
      </form>
    </div>
  );
}
