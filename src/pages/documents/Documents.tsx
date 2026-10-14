import React, { useState } from 'react';
import {
  Search,
  FolderOpen,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Upload,
  MoreHorizontal,
  Grid3X3,
  List,
  Download,
  Trash2,
  CloudUpload,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Card, CardContent } from '@/components/ui/card/card';
import { Badge } from '@/components/ui/badge/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { toast } from 'sonner';
import {
  useDocumentsList,
  useDocumentFolders,
  useCreateDocument,
  useDeleteDocument,
} from '@/hooks/useDocuments';
import { DocumentType } from '@lib/shared';

import styles from './Documents.module.css';

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className={styles.iconRed} />,
  doc: <FileText className={styles.iconBlue} />,
  spreadsheet: <FileSpreadsheet className={styles.iconEmerald} />,
  image: <ImageIcon className={styles.iconPink} />,
  design: <FileText className={styles.iconViolet} />,
};

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('Todos');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form de novo documento
  const [newName, setNewName] = useState('');
  const [newFolder, setNewFolder] = useState('Certificações');
  const [newType, setNewType] = useState<any>(DocumentType.Pdf);

  const { data: documents = [], isLoading } = useDocumentsList(
    search || undefined,
    selectedFolder !== 'Todos' ? selectedFolder : undefined,
  );
  const { data: folders = [] } = useDocumentFolders();
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await createDocument.mutateAsync({
        name: newName.trim().endsWith('.pdf')
          ? newName.trim()
          : `${newName.trim()}.pdf`,
        folder: newFolder,
        type: newType,
        size: '1.5 MB',
      });

      toast.success('Documento registrado com sucesso!');
      setNewName('');
      setIsDialogOpen(false);
    } catch {
      toast.error('Erro ao registrar o documento.');
    }
  };

  const handleDeleteDocument = async (id: string, name: string) => {
    try {
      await deleteDocument.mutateAsync(id);
      toast.success(`Documento "${name}" excluído.`);
    } catch {
      toast.error('Erro ao excluir documento.');
    }
  };

  const handleDownload = (name: string) => {
    toast.info(`Iniciando download seguro de ${name}...`);
  };

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Documentos & Laudos</h1>
          <p className={styles.subtitle}>
            Armazene e gerencie certificações de carbono, laudos de solo e
            relatórios de satélite.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className={styles.btnIconLeft} />
              Enviar Arquivo
            </Button>
          </DialogTrigger>
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>Registrar Novo Laudo ou Documento</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateDocument} className={styles.dialogBody}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Nome do Arquivo
                </label>
                <Input
                  placeholder="Ex: Laudo-Solo-Talhao-A.pdf"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Pasta / Categoria
                  </label>
                  <Select value={newFolder} onValueChange={setNewFolder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Certificações">
                        Certificações
                      </SelectItem>
                      <SelectItem value="Laudos Técnicos">
                        Laudos Técnicos
                      </SelectItem>
                      <SelectItem value="CAR & Regularização">
                        CAR & Regularização
                      </SelectItem>
                      <SelectItem value="Planilhas & Dados">
                        Planilhas & Dados
                      </SelectItem>
                      <SelectItem value="Sensoriamento Remoto">
                        Sensoriamento Remoto
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Tipo de Arquivo
                  </label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DocumentType.Pdf}>
                        PDF Document
                      </SelectItem>
                      <SelectItem value={DocumentType.Spreadsheet}>
                        Planilha Excel
                      </SelectItem>
                      <SelectItem value={DocumentType.Image}>
                        Imagem de Satélite
                      </SelectItem>
                      <SelectItem value={DocumentType.Doc}>
                        Texto DOCX
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={styles.dropzone}>
                <CloudUpload className={styles.dropzoneIcon} />
                <p className={styles.dropzoneTitle}>
                  Arraste o arquivo ou clique para selecionar
                </p>
                <p className={styles.dropzoneSubtitle}>
                  PDF, XLSX, PNG ou DOCX (até 20MB)
                </p>
              </div>

              <Button type="submit" disabled={createDocument.isPending}>
                {createDocument.isPending && (
                  <Loader2
                    className="animate-spin"
                    size={16}
                    style={{ marginRight: '6px' }}
                  />
                )}
                Salvar Documento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pastas / Categorias */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
          }}
        >
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>
            Pastas de Auditoria
          </h2>
          <Button
            variant={selectedFolder === 'Todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFolder('Todos')}
          >
            Todas as Pastas
          </Button>
        </div>

        <div className={styles.folderGrid}>
          {folders.map((f) => {
            const isSelected = selectedFolder === f.name;
            return (
              <Card
                key={f.name}
                className={`${styles.folderCard} ${isSelected ? styles.selectedRow : ''}`}
                onClick={() => setSelectedFolder(f.name)}
                style={{ cursor: 'pointer' }}
              >
                <CardContent className={styles.folderCardContent}>
                  <div className={styles.folderIconWrapper}>
                    <FolderOpen className={styles.folderIcon} />
                  </div>
                  <div>
                    <h3 className={styles.folderName}>{f.name}</h3>
                    <p className={styles.folderCount}>{f.files} arquivos</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Barra de Busca e Visualização */}
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Buscar documentos por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.viewToggleGroup}>
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
            title="Visualização em Grade"
          >
            <Grid3X3 className={styles.btnIconMedium} />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
            title="Visualização em Lista"
          >
            <List className={styles.btnIconMedium} />
          </Button>
        </div>
      </div>

      {/* Listagem de Arquivos */}
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '3rem',
            color: 'var(--muted-foreground)',
          }}
        >
          <Loader2 className="animate-spin" size={36} />
          <p style={{ marginTop: '0.75rem' }}>Carregando documentos...</p>
        </div>
      ) : documents.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--muted-foreground)',
            border: '1px dashed var(--border)',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontWeight: 600 }}>Nenhum documento encontrado.</p>
          <p style={{ fontSize: '0.8125rem' }}>
            Envie um novo laudo ou certificado pelo botão acima.
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className={styles.fileGrid}>
          {documents.map((file) => (
            <Card key={file.id} className={styles.fileCard}>
              <CardContent className={styles.fileCardContent}>
                <div className={styles.fileCardHeader}>
                  <div className={styles.fileCardIconWrapper}>
                    {fileTypeIcons[file.type] || (
                      <FileText className={styles.iconBlue} />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={styles.moreButton}
                      >
                        <MoreHorizontal className={styles.btnIconMedium} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDownload(file.name)}
                      >
                        <Download className={styles.btnIconLeft} />
                        Baixar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={styles.menuItemDanger}
                        onClick={() => handleDeleteDocument(file.id, file.name)}
                      >
                        <Trash2 className={styles.btnIconLeft} />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className={styles.fileName} title={file.name}>
                  {file.name}
                </p>

                <div className={styles.fileCardMeta}>
                  <span className={styles.fileSize}>{file.size}</span>
                  <Badge variant="outline" className={styles.folderBadge}>
                    {file.folder}
                  </Badge>
                </div>

                <div className={styles.fileCardFooter}>
                  <div className={styles.fileCardUser}>
                    <Avatar className={styles.userAvatarSmall}>
                      <AvatarFallback className={styles.userInitialsSmall}>
                        {file.userName
                          ? file.userName.slice(0, 2).toUpperCase()
                          : 'SX'}
                      </AvatarFallback>
                    </Avatar>
                    <span className={styles.fileDate}>
                      {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Pasta</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Enviado por</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className={styles.tableHeadActions}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className={styles.fileNameCell}>
                    <div className={styles.fileNameInner}>
                      {fileTypeIcons[file.type] || (
                        <FileText className={styles.iconBlue} />
                      )}
                      <span className={styles.fileNameText} title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={styles.folderBadge}>
                      {file.folder}
                    </Badge>
                  </TableCell>
                  <TableCell className={styles.fileSizeCell}>
                    {file.size}
                  </TableCell>
                  <TableCell>
                    <div className={styles.userNameInner}>
                      <Avatar className={styles.userAvatarSmall}>
                        <AvatarFallback className={styles.userInitialsSmall}>
                          {file.userName
                            ? file.userName.slice(0, 2).toUpperCase()
                            : 'SX'}
                        </AvatarFallback>
                      </Avatar>
                      <span className={styles.userNameText}>
                        {file.userName || 'Produtor'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={styles.fileDateCell}>
                    {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className={styles.tableCellActions}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file.name)}
                      title="Baixar arquivo"
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDocument(file.id, file.name)}
                      title="Excluir"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
