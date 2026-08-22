function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className={styles.infoLabel}>
        <Icon size={12} />
        {label}
      </dt>
      <dd className={styles.infoValue}>{value}</dd>
    </div>
  );
}
