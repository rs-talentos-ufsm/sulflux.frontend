import * as React from 'react';
import {
  CloudUpload,
  FileText,
  CheckCircle2,
  ImageIcon,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Button } from '@/components/ui/button/button';
import { Progress } from '@/components/ui/progress/progress';

import styles from './UploadDialog.module.css';

type UploadStatus = 'uploading' | 'completed';

interface UploadFile {
  name: string;
  size: string;
  progress: number;
  status: UploadStatus;
  file: File;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  accept?: string;
  hint?: string;
  /** Chamado quando o usuário confirma a seleção */
  onConfirm?: (files: UploadFile[]) => void;
}

export function UploadDialog({
  open,
  onOpenChange,
  title = 'Enviar arquivos',
  description = 'Selecione um arquivo do seu dispositivo ou arraste para a área abaixo.',
  accept = 'PDF, DOCX, PNG, JPG até 10MB',
  hint = 'Escolha um arquivo ou arraste aqui',
  onConfirm,
}: UploadDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [files, setFiles] = React.useState<UploadFile[]>([]);

  const isImageOnly =
    accept.toLowerCase().includes('png') &&
    !accept.toLowerCase().includes('pdf');

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const mapped: UploadFile[] = Array.from(list).map((f) => ({
      name: f.name,
      size: formatBytes(f.size),
      progress: 100,
      status: 'completed' as const,
      file: f,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function handleConfirm() {
    onConfirm?.(files);
    onOpenChange(false);
  }

  // Limpa a lista ao fechar
  React.useEffect(() => {
    if (!open) setFiles([]);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className={styles.contentWrapper}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`}
          >
            {isImageOnly ? (
              <ImageIcon className={styles.dropzoneIcon} />
            ) : (
              <CloudUpload className={styles.dropzoneIcon} />
            )}
            <p className={styles.hint}>{hint}</p>
            <p className={styles.accept}>{accept}</p>
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept={isImageOnly ? 'image/*' : undefined}
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />

          {files.length > 0 && (
            <div className={styles.fileList}>
              {files.map((file) => (
                <div key={file.name} className={styles.fileItem}>
                  {isImageOnly ? (
                    <ImageIcon className={styles.fileIcon} />
                  ) : (
                    <FileText className={styles.fileIcon} />
                  )}

                  <div className={styles.fileInfo}>
                    <div className={styles.fileHeader}>
                      <p className={styles.fileName}>{file.name}</p>
                      {file.status === 'completed' ? (
                        <CheckCircle2 className={styles.fileStatusIcon} />
                      ) : (
                        <span className={styles.fileProgressText}>
                          {file.progress}%
                        </span>
                      )}
                    </div>
                    <p className={styles.fileSize}>{file.size}</p>
                    <Progress
                      value={file.progress}
                      className={styles.progressBar}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={styles.removeBtn}
                    onClick={() => removeFile(file.name)}
                    aria-label={`Remover ${file.name}`}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={files.length === 0}>
              Concluir envio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
