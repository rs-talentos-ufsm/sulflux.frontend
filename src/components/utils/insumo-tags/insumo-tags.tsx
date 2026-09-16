import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';

import styles from './InsumoTags.module.css';

interface InsumoTagsProps {
  label?: string;
  initial?: string[];
  suggestions?: string[];
}

export function InsumoTags({
  label = 'Adicionar Insumo',
  initial = [],
  suggestions = [],
}: InsumoTagsProps) {
  const [tags, setTags] = useState<string[]>(initial);
  const [value, setValue] = useState('');

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
    setValue('');
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>{label}</p>

      <div className={styles.tagsContainer}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tagBadge}>
            {tag}
            <button
              type="button"
              onClick={() => setTags(tags.filter((t) => t !== tag))}
              aria-label={`Remover ${tag}`}
              className={styles.removeBtn}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className={styles.emptyText}>Nenhum insumo adicionado</span>
        )}
      </div>

      <div className={styles.inputGroup}>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              e.preventDefault();
              addTag(value);
            }
          }}
          placeholder="Ex: KCL, Glifosato..."
          className={styles.inputControl}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className={styles.addBtn}
          onClick={() => addTag(value)}
        >
          <Plus size={16} />
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className={styles.tagsContainer}>
          {suggestions
            .filter((s) => !tags.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className={styles.suggestionBtn}
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
