import { useEffect, useState } from 'react';
// Adicionei o ArrowLeft nos imports
import {
  CheckCircle2,
  XCircle,
  Server,
  Monitor,
  Loader2,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import styles from './Health.module.css';
import api from '../../api/api';
// Se usar react-router-dom, descomente a linha abaixo:
// import { useNavigate } from 'react-router-dom';

export default function HealthPage() {
  const [backendStatus, setBackendStatus] = useState('loading');
  const [message, setMessage] = useState('Verificando serviços...');

  // const navigate = useNavigate(); // Para react-router-dom

  const handleBackToDashboard = () => {
    // Exemplo com react-router-dom:
    // navigate('/dashboard');

    // Exemplo com window.location (Navegação nativa do navegador):
    window.location.href = '/dashboard';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/health');
        setMessage(res.data.message || 'API operando normalmente');
        setBackendStatus('success');
      } catch (error) {
        console.error('Erro ao conectar com o backend: ', error);
        setMessage('Falha na conexão com o servidor');
        setBackendStatus('error');
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Cabeçalho */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Activity size={28} className={styles.pulseIcon} />
          </div>
          <h1 className={styles.title}>Status do Sistema</h1>
          <p className={styles.subtitle}>
            Monitoramento de serviços em tempo real
          </p>
        </div>

        {/* Lista de Serviços */}
        <div className={styles.servicesList}>
          <div className={styles.serviceItem}>
            <div className={styles.serviceInfo}>
              <div className={styles.serviceIcon}>
                <Monitor size={20} />
              </div>
              <div>
                <h3 className={styles.serviceName}>Frontend (Interface)</h3>
                <p className={styles.serviceDescription}>
                  Aplicação rodando perfeitamente
                </p>
              </div>
            </div>
            <div className={`${styles.statusBadge} ${styles.success}`}>
              <CheckCircle2 size={16} />
              <span>Online</span>
            </div>
          </div>

          <div className={styles.serviceItem}>
            <div className={styles.serviceInfo}>
              <div className={styles.serviceIcon}>
                <Server size={20} />
              </div>
              <div>
                <h3 className={styles.serviceName}>Backend (API)</h3>
                <p className={styles.serviceDescription}>{message}</p>
              </div>
            </div>

            {backendStatus === 'loading' && (
              <div className={`${styles.statusBadge} ${styles.loading}`}>
                <Loader2 size={16} className={styles.spin} />
                <span>Testando...</span>
              </div>
            )}

            {backendStatus === 'success' && (
              <div className={`${styles.statusBadge} ${styles.success}`}>
                <CheckCircle2 size={16} />
                <span>Online</span>
              </div>
            )}

            {backendStatus === 'error' && (
              <div className={`${styles.statusBadge} ${styles.error}`}>
                <XCircle size={16} />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* NOVO: Botão de Voltar ao Dashboard */}
        <button onClick={handleBackToDashboard} className={styles.backButton}>
          <ArrowLeft size={18} />
          Voltar
        </button>
      </div>
    </div>
  );
}
