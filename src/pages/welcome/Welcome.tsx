import { Link } from 'react-router-dom';
import {
  Leaf,
  FileCheck2,
  Map as MapIcon,
  CalendarCog,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button/button';

// Importação do Hook
import { useProperties } from '@/hooks/useProperty';
import { useFields } from '@/hooks/useField';

// TODO: Importação dos Hooks futuros
// import { useTalhoes } from "@/hooks/useTalhoes"
// import { useSafras } from "@/hooks/useSafras"
// import { useResultados } from "@/hooks/useResultados"

import styles from './Welcome.module.css';

export default function BemVindoPage() {
  const { data: propertiesData } = useProperties({ page: 1, limit: 1 });
  const hasProperties = (propertiesData?.meta?.totalItems ?? 0) > 0;

  const { data: fieldsData } = useFields({ page: 1, limit: 1 });
  const hasFields = (fieldsData?.meta?.totalItems ?? 0) > 0;

  // const { data: safrasData } = useSafras({ limit: 1 })
  const hasSafras = false; // (safrasData?.meta?.totalItems ?? 0) > 0

  // const { data: resultadosData } = useResultados({ limit: 1 })
  const hasResultados = false; // (resultadosData?.meta?.totalItems ?? 0) > 0

  const steps = [
    {
      id: 'step-1',
      icon: FileCheck2,
      title: '1. Cadastre sua propriedade',
      text: 'Informe o número do CAR e importamos a geometria e os dados do imóvel automaticamente.',
      buttonText: 'Cadastrar Propriedade',
      buttonLink: '/properties/new',
      completed: hasProperties,
    },
    {
      id: 'step-2',
      icon: MapIcon,
      title: '2. Desenhe os talhões',
      text: 'Delimite cada talhão diretamente sobre o mapa de satélite da sua propriedade.',
      buttonText: 'Desenhar Talhões',
      buttonLink: `/properties/${propertiesData?.data?.[0]?.id}/fields-new`,
      completed: hasFields,
    },
    {
      id: 'step-3',
      icon: CalendarCog,
      title: '3. Configure a safra',
      text: 'Registre culturas, coberturas e manejos ao longo do ciclo produtivo.',
      buttonText: 'Configurar Safra',
      buttonLink: `/properties/${propertiesData?.data?.[0]?.id}/fields/${fieldsData?.data?.[0]?.id}/season`,
      completed: hasSafras,
    },
    {
      id: 'step-4',
      icon: BarChart3,
      title: '4. Acompanhe os resultados',
      text: 'Visualize o balanço de carbono e o monitoramento hídrico de cada talhão.',
      buttonText: 'Ver Resultados',
      buttonLink: `/properties/${propertiesData?.data?.[0]?.id}/fields/${fieldsData?.data?.[0]?.id}/results`,
      completed: hasResultados,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.heroCard}>
        <div className={styles.heroBg}>
          <div aria-hidden className={styles.heroPattern} />

          <div className={styles.heroContent}>
            <div className={styles.heroIconBox}>
              <Leaf size={28} />
            </div>
            <h1 className={styles.title}>Bem-vindo ao Sulflux</h1>
            <p className={styles.subtitle}>
              A plataforma de monitoramento agrícola que mede o balanço de
              carbono e o desempenho hídrico das suas terras. Vamos configurar
              sua primeira propriedade em poucos passos.
            </p>
          </div>
        </div>
      </div>

      {/* Passos Dinâmicos */}
      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div
            key={step.id}
            className={`${styles.stepCard} ${step.completed ? styles.stepCardCompleted : ''}`}
          >
            <span
              className={`${styles.stepIconBox} ${step.completed ? styles.stepIconBoxCompleted : ''}`}
            >
              {step.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <step.icon size={20} />
              )}
            </span>
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h3
                  className={`${styles.stepTitle} ${step.completed ? styles.stepTitleCompleted : ''}`}
                >
                  {step.title}
                </h3>
              </div>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className={styles.ctaContainer}>
        <Button asChild size="lg">
          <Link
            to={
              steps.find((step) => !step.completed)?.buttonLink ||
              '/properties/new'
            }
          >
            {steps.find((step) => !step.completed)?.buttonText ||
              'Explorar Propriedades de Exemplo'}
            <ArrowRight size={16} style={{ marginLeft: '8px' }} />
          </Link>
        </Button>
        {/* <Link
          to="/"
          className={styles.exploreLink}
        >
          Explorar propriedades de exemplo
        </Link> */}
      </div>
    </div>
  );
}
