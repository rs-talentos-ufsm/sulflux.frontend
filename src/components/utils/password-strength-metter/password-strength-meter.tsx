import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import styles from './PasswordStrengthMeter.module.css';

interface PasswordStrengthMeterProps {
  password?: string;
  onValidityChange?: (isValid: boolean) => void; // <--- Nova prop
}

export function PasswordStrengthMeter({
  password = '',
  onValidityChange,
}: PasswordStrengthMeterProps) {
  const criteria = [
    { label: 'Pelo menos 8 caracteres', met: password.length >= 8 },
    { label: 'Pelo menos 1 letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Pelo menos 1 letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Pelo menos 1 número', met: /[0-9]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const isAllMet = metCount === criteria.length;

  // Avisa o componente pai sempre que a validade da senha mudar
  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(isAllMet);
    }
  }, [isAllMet, onValidityChange]);

  let strengthLabel = 'Senha fraca';
  let barColors = [styles.bgMuted, styles.bgMuted, styles.bgMuted];

  if (password.length > 0) {
    if (metCount <= 2) {
      strengthLabel = 'Senha fraca';
      barColors = [styles.bgDestructive, styles.bgMuted, styles.bgMuted];
    } else if (metCount === 3) {
      strengthLabel = 'Senha média';
      barColors = [styles.bgAmber, styles.bgAmber, styles.bgMuted];
    } else if (metCount === 4) {
      strengthLabel = 'Senha forte';
      barColors = [styles.bgEmerald, styles.bgEmerald, styles.bgEmerald];
    }
  } else {
    strengthLabel = 'Digite uma senha';
  }

  return (
    <div className={styles.container}>
      <div className={styles.barsContainer}>
        <div className={`${styles.bar} ${barColors[0]}`} />
        <div className={`${styles.bar} ${barColors[1]}`} />
        <div className={`${styles.bar} ${barColors[2]}`} />
      </div>

      <p className={styles.statusLabel}>
        {strengthLabel}
        {!isAllMet && password.length > 0 ? '. Deve conter:' : ''}
      </p>

      <ul className={styles.criteriaList}>
        {criteria.map((item, index) => (
          <li key={index} className={styles.criterionItem}>
            {item.met ? (
              <CheckCircle2 className={`${styles.icon} ${styles.iconMet}`} />
            ) : (
              <XCircle className={`${styles.icon} ${styles.iconUnmet}`} />
            )}
            <span
              className={`${styles.textBase} ${item.met ? styles.textMet : ''}`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
