import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog/dialog';
import { Button } from '@/components/ui/button/button';
import { useTenantStore, type TenantType } from '@/store/tenantStore';
import styles from './NewClientDialog.module.css';

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  '#10b981', // Verde Esmeralda
  '#0284c7', // Azul Céu
  '#8b5cf6', // Roxo Violeta
  '#f59e0b', // Âmbar Dourado
  '#ec4899', // Rosa Intenso
  '#14b8a6', // Teal
];

export default function NewClientDialog({
  open,
  onOpenChange,
}: NewClientDialogProps) {
  const addClient = useTenantStore((s) => s.addClient);

  const [name, setName] = useState('');
  const [type, setType] = useState<TenantType>('COMPANY');
  const [document, setDocument] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addClient({
      name: name.trim(),
      type,
      document: document.trim() || undefined,
      color,
    });

    setName('');
    setDocument('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '26rem' }}>
        <DialogHeader>
          <DialogTitle>Novo Produtor ou Empresa</DialogTitle>
          <DialogDescription>
            Cadastre um novo cliente, cooperativa ou empresa agrícola para
            gerenciar fazendas e relatórios de forma isolada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              Nome da Organização / Produtor
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fazendas Vale Verde / Agropecuária Silva"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tipo de Entidade</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TenantType)}
              className={styles.select}
            >
              <option value="PRODUCER">Produtor Rural (Pessoa Física)</option>
              <option value="COMPANY">Empresa / Agropecuária (PJ)</option>
              <option value="COOPERATIVE">Cooperativa Agrícola</option>
              <option value="CONSULTANCY">Consultoria Agronômica</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>CPF ou CNPJ (Opcional)</label>
            <input
              type="text"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Cor de Identificação</label>
            <div className={styles.colorGrid}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`${styles.colorOption} ${
                    color === c ? styles.colorOptionActive : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter style={{ marginTop: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Cadastrar e Ativar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
