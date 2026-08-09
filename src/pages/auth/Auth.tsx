'use client';
import { useState } from 'react';
import styles from './Auth.module.css';
import Login from './login/Login';
import Register from './register/Register';
// import Forgot from "./forgot/Forgot"

export default function AuthPage() {
  const [currentView, setCurrentView] = useState('login');

  return (
    <div className={styles.container}>
      {/* Lado Esquerdo - Branding (Oculto em telas pequenas) */}
      <div className={styles.brandSection}>
        <div className={styles.brandContent}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoIcon}>
              <img
                className={styles.logoDotMobile}
                src="/pgi.svg"
                alt="PGI-PROA"
              />
            </div>
            <h1 className={styles.logoText}>PGI-PROA</h1>
          </div>

          <div className={styles.heroText}>
            <h2>Gerencie sua equipe sem esforço.</h2>
            <p>Faça login para gerenciar sua equipe.</p>
          </div>

          <div className={styles.footer}>
            <span>Copyright ©2026 PGI-PROA.</span>
            {/* <span className={styles.privacyLink}>Política de Privacidade</span> */}
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulários Dinâmicos */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          {/* Logo mobile */}
          <div className={styles.mobileLogo}>
            <div className={styles.logoIconMobile}>
              <img
                className={styles.logoDotMobile}
                src="/pgi.svg"
                alt="PGI-PROA"
              />
            </div>
            <h1>PGI-PROA</h1>
          </div>

          {/* Renderização Condicional das Telas */}
          {currentView === 'login' && (
            <Login
              onNavigateToRegister={() => setCurrentView('register')}
              onNavigateToForgot={() => setCurrentView('forgot')}
            />
          )}

          {currentView === 'register' && (
            <Register onNavigateToLogin={() => setCurrentView('login')} />
          )}

          {/* {currentView === "forgot" && (
            <Forgot 
              onNavigateToLogin={() => setCurrentView("login")} 
            />
          )} */}
        </div>
      </div>
    </div>
  );
}
