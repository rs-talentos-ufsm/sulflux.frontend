import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  // Filter,
  Play,
  Pause,
  Eye,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Minus,
  Square,
} from 'lucide-react';

import {
  TaskStatus,
  TaskPriority,
  type EnumTaskStatus,
  formatMinutesToReadable,
} from '@lib/shared';

import { useTasks } from '../../hooks/useTasks';
import { useToggleTimer } from '../../hooks/useTimeTracking';

import { Button } from '../../components/ui/button/button';
import { NewTaskDialog } from '../../components/forms/new-task-dialog/new-task-dialog';
import { RegisterHoursSheet } from '@/components/forms/register-hours-sheet/register-hours-sheet';
import { Input } from '../../components/ui/input/input';
import { Badge } from '../../components/ui/badge/badge';
import { Card, CardContent } from '../../components/ui/card/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select/select';

import styles from './Tasks.module.css';
// import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@radix-ui/react-dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip/tooltip';

const statusLabels: Record<EnumTaskStatus, string> = {
  BACKLOG: 'Backlog',
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  IN_REVIEW: 'Em Revisão',
  COMPLETED: 'Concluído',
  ARCHIVED: 'Arquivado',
};

const priorityConfig: Record<string, { label: string; icon: React.ReactNode }> =
  {
    URGENT: {
      label: 'Urgente',
      icon: <ChevronUp className={styles.iconUrgent} />,
    },
    HIGH: { label: 'Alta', icon: <ChevronUp className={styles.iconHigh} /> },
    MEDIUM: { label: 'Média', icon: <Minus className={styles.iconMedium} /> },
    LOW: { label: 'Baixa', icon: <ChevronDown className={styles.iconLow} /> },
  };

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('opened');
  // const [priorityFilter, setPriorityFilter] = useState<string>("all")

  // Busca as tarefas da API
  const { data: responseData, isLoading, isError } = useTasks(1, 50);

  // O Hook de Mutação para o Play/Pause do Backend
  const toggleTimerMutation = useToggleTimer();

  const tasks = responseData?.data || [];

  const filteredTasks = tasks.filter((t) => {
    const status = (t as any).status || TaskStatus.Pending;

    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      status === statusFilter ||
      (statusFilter === 'opened' &&
        status !== TaskStatus.Completed &&
        status !== TaskStatus.Archived &&
        status !== TaskStatus.Backlog);
    // const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter

    return matchesSearch && matchesStatus; // && matchesPriority
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tarefas</h1>
          <p className={styles.subtitle}>
            Gerencie e acompanhe todas as suas tarefas
          </p>
        </div>
        <NewTaskDialog />
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Buscar por título ou ID..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.statusSelect}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="opened">Em Aberto</SelectItem>
              {Object.values(TaskStatus).map((statusValue) => {
                const status = statusValue as EnumTaskStatus;
                return (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className={styles.triggerButton}>
              <Filter className={styles.filterIcon} />
              {priorityFilter !== "all" && (
                <span className={styles.activeBadge} />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={styles.dropdownContent}>
            <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={priorityFilter} onValueChange={setPriorityFilter}>
              <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="urgent">Urgente</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="high">Alta</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="medium">Media</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="low">Baixa</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      <Card>
        <CardContent className={styles.tableCardContent}>
          {isLoading ? (
            <div className={styles.stateMessage}>Carregando tarefas...</div>
          ) : isError ? (
            <div className={styles.errorMessage}>Erro ao carregar tarefas.</div>
          ) : filteredTasks.length === 0 ? (
            <div className={styles.stateMessage}>
              Nenhuma tarefa encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={styles.tableHeadId}>ID</TableHead>
                  <TableHead className={styles.hiddenMdTableCell}>
                    Ações
                  </TableHead>
                  <TableHead>Tarefa</TableHead>
                  <TableHead className={styles.hiddenMdTableCell}>
                    Projeto
                  </TableHead>
                  <TableHead className={styles.hiddenLgTableCell}>
                    Status
                  </TableHead>
                  <TableHead className={styles.hiddenLgTableCell}>
                    Prioridade
                  </TableHead>
                  <TableHead className={styles.hiddenMdTableCell}>
                    Prazo
                  </TableHead>
                  <TableHead className={styles.tableCellRight}>Horas</TableHead>
                  <TableHead className={styles.tableHeadAction} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const rawStatus = (task as any).status || TaskStatus.Pending;
                  const rawPriority = task.priority || TaskPriority.Medium;

                  const currentStatus =
                    statusLabels[rawStatus] ||
                    statusLabels[String(rawStatus).toUpperCase()] ||
                    statusLabels[TaskStatus.Pending];

                  const currentPriority =
                    priorityConfig[rawPriority] ||
                    priorityConfig[String(rawPriority).toUpperCase()] ||
                    priorityConfig[TaskPriority.Medium];

                  const project = (task as any).project?.name || 'N/A';
                  const totalMinutes = (task as any).totalMinutes || 0;

                  // Consumindo a flag verdadeira do backend
                  const isTimerActive = (task as any).isTimerActive || false;
                  const hasPendingSessions =
                    (task as any).hasPendingSessions || false;

                  return (
                    <TableRow
                      key={task.id}
                      className={[
                        styles.tableRow,
                        currentStatus.borderClass,
                      ].join(' ')}
                    >
                      <TableCell className={styles.taskId}>
                        {task.id.split('-')[0].toUpperCase()}
                      </TableCell>

                      {/* CÉLULA DE TIMER E AÇÕES RÁPIDAS */}
                      <TableCell className={styles.hiddenMdTableCell}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={`/tasks/${task.id}`}
                                className={[
                                  styles.timerButton,
                                  styles.timerButtonInactive,
                                ].join(' ')}
                              >
                                <Search className={styles.timerIcon} />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>

                          {/* Botão de Play / Pause */}
                          {task.status !== TaskStatus.Completed &&
                            task.status !== TaskStatus.Archived && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleTimerMutation.mutate(task.id)
                                    }
                                    disabled={toggleTimerMutation.isPending}
                                    className={[
                                      styles.timerButton,
                                      isTimerActive
                                        ? styles.timerButtonPause
                                        : styles.timerButtonPlay,
                                    ].join(' ')}
                                  >
                                    {isTimerActive ? (
                                      <Pause className={styles.timerIcon} />
                                    ) : (
                                      <Play className={styles.timerIcon} />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isTimerActive
                                    ? 'Pausar tarefa'
                                    : 'Iniciar tarefa'}
                                </TooltipContent>
                              </Tooltip>
                            )}

                          {/* Botão de Stop (Finalizar) engatado no modal diretamente */}
                          {!isTimerActive && hasPendingSessions && (
                            <RegisterHoursSheet
                              taskId={task.id}
                              trigger={
                                <button
                                  type="button"
                                  title="Finalizar e Registrar Horas"
                                  className={[
                                    styles.timerButton,
                                    styles.timerButtonStop,
                                  ].join(' ')}
                                >
                                  <Square className={styles.timerIcon} />
                                </button>
                              }
                            />
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Link
                          to={`/tasks/${task.id}`}
                          className={styles.taskLink}
                        >
                          {task.title}
                        </Link>
                      </TableCell>

                      {/* Projeto da Tarefa */}
                      <TableCell className={styles.hiddenMdTableCell}>
                        <Badge
                          variant="secondary"
                          className={styles.badgeProject}
                        >
                          {project}
                        </Badge>
                      </TableCell>

                      {/* Status da Tarefa */}
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${styles.badgeNoBorder} ${styles[task.status.toLowerCase()] || ''}`}
                        >
                          {statusLabels[
                            task.status as keyof typeof statusLabels
                          ] || task.status}
                        </Badge>
                      </TableCell>

                      <TableCell className={styles.hiddenLgTableCell}>
                        <div className={styles.priorityContainer}>
                          {currentPriority.icon}
                          <span className={styles.priorityText}>
                            {currentPriority.label}
                          </span>
                        </div>
                      </TableCell>

                      {/* Prazo da Tarefa */}
                      <TableCell
                        className={[
                          styles.hiddenMdTableCell,
                          styles.deadlineText,
                        ].join(' ')}
                        style={{
                          color: (() => {
                            if (!task.dueDate) return 'inherit';

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const dueDate = new Date(task.dueDate);
                            dueDate.setHours(0, 0, 0, 0);

                            if (dueDate < today) return 'var(--destructive)';
                            if (dueDate.getTime() === today.getTime())
                              return 'orange';

                            return 'inherit';
                          })(),
                        }}
                      >
                        {task.dueDate
                          ? format(new Date(task.dueDate), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })
                          : '-'}
                      </TableCell>

                      <TableCell className={styles.tableCellRight}>
                        <div className={styles.hoursContainer}>
                          <span
                            className={[
                              styles.hoursText,
                              isTimerActive ? styles.hoursTextActive : '',
                            ].join(' ')}
                          >
                            {/* {hours}h */}
                            {formatMinutesToReadable(totalMinutes)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={styles.actionButton}
                            >
                              <MoreHorizontal className={styles.actionIcon} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/tasks/${task.id}`}>
                                <Eye className={styles.actionIconMargin} />
                                Ver detalhes
                              </Link>
                              {/* <DropdownMenuItem className={styles.textDestructive}>Deletar</DropdownMenuItem> */}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
