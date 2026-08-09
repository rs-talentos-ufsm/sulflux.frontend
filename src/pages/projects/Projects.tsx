import { useState } from 'react';
import {
  FolderOpen,
  Search,
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button/button';
import { NewProjectSheet } from '@/components/forms/new-project-sheet/new-project-sheet';
import { Input } from '@/components/ui/input/input';
import { Badge } from '@/components/ui/badge/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card/card';
import { Progress } from '@/components/ui/progress/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';

import styles from './Projects.module.css';
import { useProjects } from '@/hooks/useProjects';

type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'planning';

// A interface visual da sua tela (mantida)
interface ProjectVisual {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  members: { initials: string }[];
  tasksCompleted: number;
  tasksTotal: number;
  hoursLogged: number;
  hoursEstimated: number;
  tags: string[];
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; styleClass: string }
> = {
  active: { label: 'Ativo', styleClass: styles.statusActive },
  on_hold: { label: 'Pausado', styleClass: styles.statusOnHold },
  completed: { label: 'Concluido', styleClass: styles.statusCompleted },
  planning: { label: 'Planejando', styleClass: styles.statusPlanning },
};

const tagColors: Record<string, string> = {
  Frontend: styles.tagFrontend,
  Backend: styles.tagBackend,
  Design: styles.tagDesign,
  DevOps: styles.tagDevOps,
  Mobile: styles.tagMobile,
  'E-commerce': styles.tagEcommerce,
  Data: styles.tagData,
};

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: paginatedProjects, isLoading, isError } = useProjects();

  // Extrai o array de projetos da resposta do backend
  const backendProjects = paginatedProjects?.data || [];

  const projects: ProjectVisual[] = backendProjects.map((p) => ({
    id: p.id,
    name: p.name,
    // Como esses dados ainda não existem no backend, usamos fallbacks visuais
    description: 'Sem descrição definida no banco de dados.',
    status: 'active',
    progress: 0,
    startDate: new Date(p.createdAt).toLocaleDateString('pt-BR'),
    endDate: 'Indefinido',
    members: [{ initials: 'FD' }],
    tasksCompleted: 0,
    tasksTotal: 0,
    hoursLogged: 0,
    hoursEstimated: 0,
    tags: ['Backend'],
  }));

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const totalHours = projects.reduce((acc, p) => acc + p.hoursLogged, 0);

  // Tratamento de Loading e Erro nativos do React Query
  if (isLoading) {
    return (
      <div
        className={`${styles.container} flex items-center justify-center h-full min-h-[400px]`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`${styles.container} flex items-center justify-center h-full min-h-[400px]`}
      >
        <p className="text-destructive">
          Erro ao carregar os projetos. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Projetos</h1>
          <p className={styles.pageDescription}>
            Visão geral e acompanhamento de projetos da squad
          </p>
        </div>
        <NewProjectSheet />
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <CardHeader className={styles.statCardHeader}>
            <CardTitle className={styles.statCardTitle}>
              Total de Projetos
            </CardTitle>
            <FolderOpen className={styles.statIconMuted} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={styles.statCardHeader}>
            <CardTitle className={styles.statCardTitle}>Ativos</CardTitle>
            <TrendingUp className={styles.statIconEmerald} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={styles.statCardHeader}>
            <CardTitle className={styles.statCardTitle}>
              Horas Investidas
            </CardTitle>
            <Clock className={styles.statIconMuted} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{totalHours}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={styles.statCardHeader}>
            <CardTitle className={styles.statCardTitle}>Concluídos</CardTitle>
            <CheckCircle2 className={styles.statIconBlue} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>
              {projects.filter((p) => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Buscar projetos..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="on_hold">Pausado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="planning">Planejando</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.projectsGrid}>
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            Nenhum projeto encontrado.
          </div>
        ) : (
          filtered.map((project) => (
            <Card key={project.id} className={styles.projectCard}>
              <CardHeader className={styles.cardHeader}>
                <div className={styles.cardHeaderTop}>
                  <div className={styles.cardTitleWrapper}>
                    <div className={styles.cardIdWrapper}>
                      {/* Pegando os 6 primeiros caracteres do UUID para ficar visualmente bonito como ID */}
                      <span className={styles.projectId}>
                        #{project.id.slice(0, 6)}
                      </span>
                      <Badge
                        variant="secondary"
                        className={[
                          styles.badge,
                          statusConfig[project.status].styleClass,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {statusConfig[project.status].label}
                      </Badge>
                    </div>
                    <CardTitle className={styles.projectName}>
                      <Link
                        to={`/squad/projects/${project.id}`}
                        className={styles.projectLink}
                      >
                        {project.name}
                      </Link>
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={styles.menuTrigger}
                      >
                        <MoreHorizontal className={styles.iconSmall} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/squad/projects/${project.id}`}>
                          <ArrowUpRight
                            className={styles.iconSmall}
                            style={{ marginRight: '0.5rem' }}
                          />
                          Abrir projeto
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem className={styles.textDestructive}>Arquivar</DropdownMenuItem> */}
                      {/* <DropdownMenuItem className={styles.textDestructive}>Deletar</DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className={styles.projectDescription}>
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.cardContent}>
                <div>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Progresso</span>
                    <span className={styles.progressValue}>
                      {project.progress}%
                    </span>
                  </div>
                  <Progress
                    value={project.progress}
                    className={styles.progressBar}
                  />
                </div>

                <div className={styles.tagsContainer}>
                  {project.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={[styles.tagBadge, tagColors[tag] || '']
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className={styles.metricsGrid}>
                  <div className={styles.metricBox}>
                    <p className={styles.metricLabel}>Tarefas</p>
                    <p className={styles.metricValue}>
                      {project.tasksCompleted}/{project.tasksTotal}
                    </p>
                  </div>
                  <div className={styles.metricBox}>
                    <p className={styles.metricLabel}>Horas</p>
                    <p className={styles.metricValue}>{project.hoursLogged}h</p>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.membersList}>
                    {project.members.map((m, i) => (
                      <Avatar key={i} className={styles.memberAvatar}>
                        <AvatarFallback className={styles.memberFallback}>
                          {m.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className={styles.dueDate}>
                    <Calendar className={styles.dateIcon} />
                    <span>{project.endDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
