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
import { toast } from 'sonner';
import api from '@/api/api';
import styles from './SearchSicar.module.css';

// Expressão regular oficial do CAR nacional no SICAR: UF-XXXXXXX-32HEX (43 caracteres)
const CAR_REGEX = /^[A-Z]{2}-\d{7}-[A-F0-9]{32}$/;

export default function SearchSicarPage() {
  const navigate = useNavigate();
  const [car, setCar] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleBuscar() {
    const trimmedCar = car.trim().toUpperCase();
    if (!trimmedCar) {
      toast.error('Informe o número do CAR para realizar a busca.');
      return;
    }

    if (!CAR_REGEX.test(trimmedCar)) {
      toast.error(
        'Formato do CAR inválido. O padrão oficial nacional do SICAR exige 43 caracteres: UF-XXXXXXX-32HEX (ex: RS-4305108-8C646BEA3C084EEBA1C765BB8E09FA83).',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.get('/api/properties/car/lookup', {
        params: { car: trimmedCar },
      });

      const carData = response.data;
      toast.success(
        `CAR localizado com sucesso: ${carData.name} (${carData.location})`,
      );

      navigate(`/properties/new/details?car=${encodeURIComponent(trimmedCar)}`);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error(
          error.response.data?.detail ||
            'Este número de CAR já está cadastrado em outra propriedade no sistema.',
        );
      } else if (error?.response?.status === 400) {
        toast.error(
          error.response.data?.detail ||
            'Número do CAR com formato inválido para o padrão nacional.',
        );
      } else if (error?.response?.status === 404) {
        toast.error(
          error.response.data?.detail ||
            'CAR não localizado na base de dados do SICAR.',
        );
      } else {
        toast.error(
          'Falha ao conectar com o serviço do SICAR. Tente novamente ou use o cadastro manual.',
        );
      }
    } finally {
      setLoading(false);
    }
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
