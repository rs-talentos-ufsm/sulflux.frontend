'use client';

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
  Eye,
  X,
  CloudUpload,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Card, CardContent } from '@/components/ui/card/card';
import { Badge } from '@/components/ui/badge/badge';
import { Progress } from '@/components/ui/progress/progress';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs/tabs';
import { ScrollArea } from '@/components/ui/scroll-area/scroll-area';
import styles from './Documents.module.css';

const folders = [
  { name: 'General Knowledge', files: 10, theme: 'blue' },
  { name: 'Onboarding', files: 15, theme: 'emerald' },
  { name: 'Integrations', files: 8, theme: 'amber' },
  { name: 'Design Assets', files: 24, theme: 'pink' },
  { name: 'Sprint Reports', files: 12, theme: 'violet' },
  { name: 'Contracts', files: 6, theme: 'red' },
];

const files = [
  {
    id: 1,
    name: 'wireframe-v3.fig',
    type: 'design',
    size: '2.4 MB',
    addedBy: { name: 'Fernando D.', initials: 'FD' },
    date: '08/02/2026',
    folder: 'Design Assets',
  },
  {
    id: 2,
    name: 'api-documentation.pdf',
    type: 'pdf',
    size: '1.2 MB',
    addedBy: { name: 'Maria S.', initials: 'MS' },
    date: '07/02/2026',
    folder: 'Integrations',
  },
  {
    id: 3,
    name: 'sprint-retrospective-w5.docx',
    type: 'doc',
    size: '340 KB',
    addedBy: { name: 'Carlos R.', initials: 'CR' },
    date: '07/02/2026',
    folder: 'Sprint Reports',
  },
  {
    id: 4,
    name: 'brand-guidelines.pdf',
    type: 'pdf',
    size: '5.8 MB',
    addedBy: { name: 'Julia M.', initials: 'JM' },
    date: '06/02/2026',
    folder: 'Design Assets',
  },
  {
    id: 5,
    name: 'budget-q1-2026.xlsx',
    type: 'spreadsheet',
    size: '890 KB',
    addedBy: { name: 'Ana L.', initials: 'AL' },
    date: '05/02/2026',
    folder: 'General Knowledge',
  },
  {
    id: 6,
    name: 'onboarding-checklist.md',
    type: 'doc',
    size: '45 KB',
    addedBy: { name: 'Fernando D.', initials: 'FD' },
    date: '04/02/2026',
    folder: 'Onboarding',
  },
  {
    id: 7,
    name: 'architecture-diagram.png',
    type: 'image',
    size: '3.1 MB',
    addedBy: { name: 'Carlos R.', initials: 'CR' },
    date: '03/02/2026',
    folder: 'Integrations',
  },
  {
    id: 8,
    name: 'user-research-findings.pdf',
    type: 'pdf',
    size: '2.7 MB',
    addedBy: { name: 'Julia M.', initials: 'JM' },
    date: '02/02/2026',
    folder: 'General Knowledge',
  },
];

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className={`${styles.iconBase} ${styles.textRed}`} />,
  doc: <FileText className={`${styles.iconBase} ${styles.textBlue}`} />,
  spreadsheet: (
    <FileSpreadsheet className={`${styles.iconBase} ${styles.textEmerald}`} />
  ),
  image: <ImageIcon className={`${styles.iconBase} ${styles.textPink}`} />,
  design: <FileText className={`${styles.iconBase} ${styles.textViolet}`} />,
};

const mockUploads = [
  {
    name: 'my-cv.pdf',
    size: '60 KB',
    progress: 100,
    status: 'completed' as const,
  },
  {
    name: 'project-brief.docx',
    size: '245 KB',
    progress: 72,
    status: 'uploading' as const,
  },
  {
    name: 'screenshot.png',
    size: '1.2 MB',
    progress: 35,
    status: 'uploading' as const,
  },
];

const treeFolders = [
  {
    name: 'General Knowledge',
    count: 10,
    children: ['Guias', 'Processos', 'Templates'],
  },
  {
    name: 'Onboarding',
    count: 15,
    children: ['Novos Membros', 'Setup', 'Cultura'],
  },
  { name: 'Integrations', count: 8, children: ['APIs', 'Webhooks'] },
  { name: 'Design Assets', count: 24, children: ['UI Kit', 'Icons', 'Brand'] },
  { name: 'Sprint Reports', count: 12, children: [] },
  { name: 'Contracts', count: 6, children: [] },
];

const folderThemes: Record<string, string> = {
  blue: styles.folderThemeBlue,
  emerald: styles.folderThemeEmerald,
  amber: styles.folderThemeAmber,
  pink: styles.folderThemePink,
  violet: styles.folderThemeViolet,
  red: styles.folderThemeRed,
};

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = !selectedFolder || f.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Documentos</h1>
          <p className={styles.subtitle}>
            Gerenciador de arquivos e base de conhecimento
          </p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className={styles.btnIconLeft} />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>Upload de Arquivos</DialogTitle>
            </DialogHeader>
            <div className={styles.dialogBody}>
              <div className={styles.dropzone}>
                <CloudUpload className={styles.dropzoneIcon} />
                <p className={styles.dropzoneTitle}>
                  Escolha um arquivo ou arraste aqui
                </p>
                <p className={styles.dropzoneSubtitle}>
                  PDF, DOCX, PNG, JPG até 10MB
                </p>
              </div>
              <div className={styles.uploadList}>
                {mockUploads.map((file) => (
                  <div key={file.name} className={styles.uploadItem}>
                    <FileText className={styles.uploadItemIcon} />
                    <div className={styles.uploadItemDetails}>
                      <div className={styles.uploadItemHeader}>
                        <p className={styles.uploadItemName}>{file.name}</p>
                        {file.status === 'completed' ? (
                          <CheckCircle2 className={styles.iconCheck} />
                        ) : (
                          <span className={styles.uploadProgressText}>
                            {file.progress}%
                          </span>
                        )}
                      </div>
                      <p className={styles.uploadItemSize}>{file.size}</p>
                      <Progress
                        value={file.progress}
                        className={styles.progressBar}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input placeholder="Buscar..." className={styles.searchInput} />
          </div>
          <Tabs defaultValue="folders">
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="folders" className={styles.tabTrigger}>
                Pastas
              </TabsTrigger>
              <TabsTrigger value="tags" className={styles.tabTrigger}>
                Tags
              </TabsTrigger>
            </TabsList>
            <TabsContent value="folders" className={styles.tabsContent}>
              <ScrollArea className={styles.scrollArea}>
                <div className={styles.folderList}>
                  <button
                    type="button"
                    onClick={() => setSelectedFolder(null)}
                    className={`${styles.folderItem} ${!selectedFolder ? styles.folderActive : styles.folderInactive}`}
                  >
                    <span>Todos os Arquivos</span>
                    <Badge variant="secondary" className={styles.badgeCount}>
                      {files.length}
                    </Badge>
                  </button>
                  {treeFolders.map((folder) => (
                    <button
                      key={folder.name}
                      type="button"
                      onClick={() => setSelectedFolder(folder.name)}
                      className={`${styles.folderItem} ${selectedFolder === folder.name ? styles.folderActive : styles.folderInactive}`}
                    >
                      <div className={styles.folderItemLeft}>
                        <FolderOpen className={styles.iconSm} />
                        <span className={styles.truncate}>{folder.name}</span>
                      </div>
                      <Badge variant="secondary" className={styles.badgeCount}>
                        {folder.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="tags" className={styles.tabsContent}>
              <div className={styles.tagList}>
                {[
                  'Frontend',
                  'Backend',
                  'Design',
                  'DevOps',
                  'Docs',
                  'Research',
                ].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={styles.tagBadge}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <div className={styles.mobileSearchWrapper}>
              <Search className={styles.searchIcon} />
              <Input
                placeholder="Buscar arquivos..."
                className={styles.searchInputDesktop}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.desktopSearchWrapper}>
              <Search className={styles.searchIcon} />
              <Input
                placeholder="Buscar arquivos..."
                className={styles.searchInputDesktop}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.viewToggleGroup}>
              <Button
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className={styles.toggleBtnLeft}
                onClick={() => setView('grid')}
              >
                <Grid3X3 className={styles.iconSm} />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className={styles.toggleBtnRight}
                onClick={() => setView('list')}
              >
                <List className={styles.iconSm} />
              </Button>
            </div>
          </div>

          {!selectedFolder && view === 'grid' && (
            <div>
              <h2 className={styles.sectionTitle}>Pastas</h2>
              <div className={styles.folderGrid}>
                {folders.map((folder) => (
                  <button
                    key={folder.name}
                    type="button"
                    onClick={() => setSelectedFolder(folder.name)}
                    className={styles.folderCard}
                  >
                    <div
                      className={`${styles.folderCardIconWrapper} ${folderThemes[folder.theme]}`}
                    >
                      <FolderOpen className={styles.iconBase} />
                    </div>
                    <div>
                      <p className={styles.folderCardTitle}>{folder.name}</p>
                      <p className={styles.folderCardSubtitle}>
                        {folder.files} arquivos
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            {selectedFolder && (
              <div className={styles.breadcrumb}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFolder(null)}
                  className={styles.breadcrumbBtn}
                >
                  Todos
                </Button>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbActive}>
                  {selectedFolder}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.closeBtn}
                  onClick={() => setSelectedFolder(null)}
                >
                  <X className={styles.iconXs} />
                </Button>
              </div>
            )}
            <h2 className={styles.sectionTitle}>Arquivos</h2>
            <Card>
              <CardContent className={styles.tableCardContent}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className={styles.hiddenMobile}>
                        Adicionado por
                      </TableHead>
                      <TableHead className={styles.hiddenMobile}>
                        Pasta
                      </TableHead>
                      <TableHead className={styles.hiddenMobile}>
                        Tamanho
                      </TableHead>
                      <TableHead className={styles.hiddenMobile}>
                        Data
                      </TableHead>
                      <TableHead className={styles.w12} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className={styles.tableCellContent}>
                            {fileTypeIcons[file.type]}
                            <span className={styles.fileName}>{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className={styles.hiddenMobile}>
                          <div className={styles.tableCellContent}>
                            <Avatar className={styles.avatar}>
                              <AvatarFallback className={styles.avatarFallback}>
                                {file.addedBy.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className={styles.textXs}>
                              {file.addedBy.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className={styles.hiddenMobile}>
                          <Badge
                            variant="secondary"
                            className={styles.badgeNormal}
                          >
                            {file.folder}
                          </Badge>
                        </TableCell>
                        <TableCell className={styles.hiddenMobile}>
                          <span className={styles.tableTextMuted}>
                            {file.size}
                          </span>
                        </TableCell>
                        <TableCell className={styles.hiddenMobile}>
                          <span className={styles.tableTextMuted}>
                            {file.date}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={styles.actionBtn}
                              >
                                <MoreHorizontal className={styles.iconSm} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className={styles.menuIcon} />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className={styles.menuIcon} />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={styles.textDestructive}
                              >
                                <Trash2 className={styles.menuIcon} />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
