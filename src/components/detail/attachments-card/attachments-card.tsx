import { useEffect, useRef, useState } from 'react';
import {
  Paperclip,
  FileText,
  Trash2,
  Upload,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card/card';
import { Progress } from '@/components/ui/progress/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';

import styles from './AttachmentsCard.module.css';

export interface Attachment {
  name: string;
  size: string;
}

interface UploadingFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  done: boolean;
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function AttachmentsCard({
  initialAttachments = [],
}: {
  initialAttachments?: Attachment[];
}) {
  const [attachments, setAttachments] =
    useState<Attachment[]>(initialAttachments);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearInterval(t));
    };
  }, []);

  function startUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const novos: UploadingFile[] = Array.from(fileList).map((f) => ({
      id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: formatSize(f.size),
      progress: 0,
      done: false,
    }));
    setUploading((prev) => [...prev, ...novos]);

    novos.forEach((file) => {
      const timer = setInterval(() => {
        setUploading((prev) =>
          prev.map((u) => {
            if (u.id !== file.id || u.done) return u;
            const next = Math.min(
              100,
              u.progress + Math.floor(Math.random() * 18) + 8,
            );
            if (next >= 100) {
              clearInterval(timer);
              return { ...u, progress: 100, done: true };
            }
            return { ...u, progress: next };
          }),
        );
      }, 260);
      timersRef.current.push(timer);
    });
  }

  function confirmUploads() {
    const concluidos = uploading.filter((u) => u.done);
    if (concluidos.length === 0) return;
    setAttachments((prev) => [
      ...prev,
      ...concluidos.map((u) => ({ name: u.name, size: u.size })),
    ]);
    toast.success(
      concluidos.length > 1
        ? `${concluidos.length} arquivos anexados`
        : 'Arquivo anexado',
    );
    resetUploadState();
    setOpen(false);
  }

  function resetUploadState() {
    timersRef.current.forEach((t) => clearInterval(t));
    timersRef.current = [];
    setUploading([]);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetUploadState();
  }

  function removeUploading(id: string) {
    setUploading((prev) => prev.filter((u) => u.id !== id));
  }

  function removeAttachment(name: string) {
    setAttachments((prev) => prev.filter((f) => f.name !== name));
  }

  const allDone = uploading.length > 0 && uploading.every((u) => u.done);
  const isUploading = uploading.some((u) => !u.done);

  return (
    <>
      <Card>
        <CardHeader>
          <div className={styles.headerRow}>
            <CardTitle className={styles.cardTitle}>Anexos</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <Paperclip className={styles.buttonIcon} />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className={styles.content}>
          {attachments.length === 0 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={styles.emptyDropzone}
            >
              <Paperclip className={styles.emptyDropzoneIcon} />
              <span className={styles.emptyDropzoneText}>
                Adicionar arquivos
              </span>
            </button>
          )}
          {attachments.map((file) => (
            <div key={file.name} className={styles.attachmentItem}>
              <FileText className={styles.attachmentIcon} />
              <div className={styles.attachmentInfo}>
                <p className={styles.attachmentName}>{file.name}</p>
                <p className={styles.attachmentSize}>{file.size}</p>
              </div>
              <Button variant="ghost" size="sm" className={styles.downloadBtn}>
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={styles.deleteBtn}
                onClick={() => removeAttachment(file.name)}
              >
                <Trash2 className={styles.deleteIcon} />
                <span className="sr-only">Remover anexo</span>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>Adicionar anexos</DialogTitle>
            <DialogDescription>
              Selecione os arquivos para enviar. O envio é limpo ao fechar esta
              janela.
            </DialogDescription>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={styles.hiddenInput}
            onChange={(e) => {
              startUpload(e.target.files);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={styles.uploadDropzone}
          >
            <Upload className={styles.uploadIcon} />
            <span className={styles.uploadTextPrimary}>
              Clique para selecionar
            </span>
            <span className={styles.uploadTextSecondary}>
              ou arraste os arquivos aqui
            </span>
          </button>

          {uploading.length > 0 && (
            <div className={styles.uploadingList}>
              {uploading.map((file) => (
                <div key={file.id} className={styles.uploadingItem}>
                  <div className={styles.uploadingItemHeader}>
                    {file.done ? (
                      <CheckCircle2 className={styles.iconSuccess} />
                    ) : (
                      <Loader2 className={styles.iconLoading} />
                    )}
                    <span className={styles.uploadingName}>{file.name}</span>
                    <span className={styles.uploadingSize}>
                      {file.done ? file.size : `${file.progress}%`}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={styles.removeUploadingBtn}
                      onClick={() => removeUploading(file.id)}
                    >
                      <X className={styles.removeIcon} />
                      <span className="sr-only">Remover</span>
                    </Button>
                  </div>
                  <Progress
                    value={file.progress}
                    className={[
                      styles.progress,
                      file.done ? styles.progressDone : styles.progressLoading,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmUploads}
              disabled={!allDone || isUploading}
              className={styles.submitBtn}
            >
              {isUploading ? 'Enviando...' : 'Concluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
