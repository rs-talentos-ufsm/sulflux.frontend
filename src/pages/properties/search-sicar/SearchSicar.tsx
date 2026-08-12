import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import styles from './SearchSicar.module.css';

export default function SearchSicarPage() {
  const navigate = useNavigate();
  const [car, setCar] = useState('');
  const [loading, setLoading] = useState(false);

  // Simula a busca no SICAR
  function handleBuscar() {
    if (!car.trim()) return;
    setLoading(true);

    // Simula tempo de resposta da API do governo
    setTimeout(() => {
      setLoading(false);
      // Navega para a tela de detalhes passando o CAR via query param
      navigate(`/properties/new/details?car=${encodeURIComponent(car)}`);
    }, 1200);
  }

  return (
    <div className={styles.container}>
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate('/properties')}
        className={styles.backButton}
      >
        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
        Voltar para Propriedades
      </Button>

      <div className={styles.header}>
        <h1 className={styles.title}>Cadastrar Nova Propriedade</h1>
        <p className={styles.subtitle}>
          Informe o número do Cadastro Ambiental Rural (CAR). Os dados da
          propriedade e a geometria serão importados automaticamente da base do
          SICAR.
        </p>
      </div>

      <div className={styles.card}>
        <label className={styles.label}>Número do CAR</label>
        <p className={styles.inputHint}>Formato: UF-0000000-XXXX...</p>

        <div className={styles.searchRow}>
          <div className={styles.inputWrapper}>
            <FileCheck2 size={16} className={styles.inputIcon} />
            <Input
              value={car}
              onChange={(e) => setCar(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBuscar();
              }}
              placeholder="RS-4305108-A1F3B2C4D5E6..."
              className={styles.inputWithIcon}
            />
          </div>
          <Button
            onClick={handleBuscar}
            disabled={loading || !car.trim()}
            className="sm:w-40"
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ marginRight: '8px' }}
                />
                Buscando...
              </>
            ) : (
              <>
                <Search size={16} style={{ marginRight: '8px' }} />
                Buscar CAR
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={styles.divider}>OU</div>

      <Button
        variant="outline"
        className={styles.btnManual}
        onClick={() => navigate('/properties/new/details')}
      >
        Inserir dados manualmente
        <ArrowRight size={16} style={{ marginLeft: '8px' }} />
      </Button>
    </div>
  );
}
