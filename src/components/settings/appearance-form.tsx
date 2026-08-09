'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card/card';
// import { Label } from "../../components/ui/label/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select/select"

import styles from './AppearanceForm.module.css';

type Theme = 'light' | 'dark' | 'system';

const themeOptions = [
  {
    value: 'light' as Theme,
    label: 'Claro',
    icon: Sun,
    description: 'Tema claro para ambientes iluminados.',
    previewBg: 'bgLight',
    previewCard: 'cardLight',
    previewText: 'textLight',
    previewMuted: 'mutedLight',
  },
  {
    value: 'dark' as Theme,
    label: 'Escuro',
    icon: Moon,
    description: 'Tema escuro para reduzir fadiga visual.',
    previewBg: 'bgDark',
    previewCard: 'cardDark',
    previewText: 'textDark',
    previewMuted: 'mutedDark',
  },
  {
    value: 'system' as Theme,
    label: 'Sistema',
    icon: Monitor,
    description: 'Segue a preferencia do seu sistema operacional.',
    previewBg: 'bgSystem',
    previewCard: 'cardSystem',
    previewText: 'textSystem',
    previewMuted: 'mutedSystem',
  },
];

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // const [language, setLanguage] = useState("pt-br")
  // const [dateFormat, setDateFormat] = useState("dd-mm-yyyy")

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>Selecione a aparencia da interface.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.gridThemes}>
            {themeOptions.map((option) => {
              const isActive = mounted && theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`${styles.themeButton} ${
                    isActive
                      ? styles.themeButtonActive
                      : styles.themeButtonInactive
                  }`}
                >
                  {isActive && (
                    <div className={styles.checkBadge}>
                      <Check className={styles.checkIcon} />
                    </div>
                  )}

                  <div
                    className={`${styles.previewBox} ${styles[option.previewBg]}`}
                  >
                    <div
                      className={`${styles.previewTextBar} ${styles[option.previewText]}`}
                    />
                    <div
                      className={`${styles.previewInnerCard} ${styles[option.previewCard]}`}
                    >
                      <div
                        className={`${styles.previewMutedBarLong} ${styles[option.previewMuted]}`}
                      />
                      <div
                        className={`${styles.previewMutedBarShort} ${styles[option.previewMuted]}`}
                      />
                    </div>
                    <div
                      className={`${styles.previewInnerCard} ${styles[option.previewCard]}`}
                    >
                      <div
                        className={`${styles.previewMutedBarMedium} ${styles[option.previewMuted]}`}
                      />
                      <div
                        className={`${styles.previewMutedBarTiny} ${styles[option.previewMuted]}`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className={styles.labelHeader}>
                      <option.icon className={styles.labelIcon} />
                      <span className={styles.labelText}>{option.label}</span>
                    </div>
                    <p className={styles.labelDesc}>{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Idioma e Formato</CardTitle>
          <CardDescription>
            Configure o idioma e formatos de exibicao.
          </CardDescription>
        </CardHeader>
        <CardContent className={styles.settingsContent}>
          <div className={styles.gridSettings}>
            <div className={styles.inputGroup}>
              <Label>Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-br">Portugues (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Espanol</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={styles.inputGroup}>
              <Label>Formato de data</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
