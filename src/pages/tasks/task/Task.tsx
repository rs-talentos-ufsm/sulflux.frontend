import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  // Share2,
  // Archive,
  // Send,
  // Plus,
  Pencil,
  Check,
  X,
  UserPlus, // <-- Descomentado
  // Trash2,
  Loader2,
  // TrendingUp,
  // Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button/button';
import { Badge } from '@/components/ui/badge/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card/card';
// import { Progress } from "@/components/ui/progress/progress"
// import { Checkbox } from "@/components/ui/checkbox/checkbox"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs"
import { Avatar, AvatarFallback } from '@/components/ui/avatar/avatar'; // <-- Descomentado
// import { Input } from "@/components/ui/input/input"
import { Textarea } from '@/components/ui/textarea/textarea';
import { Separator } from '@/components/ui/separator/separator'; // <-- Descomentado
// import { ScrollArea } from "@/components/ui/scroll-area/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu/dropdown-menu'; // <-- Descomentado
import { RegisterHoursSheet } from '@/components/forms/register-hours-sheet/register-hours-sheet';
// import { AttachmentsCard } from "@/components/detail/attachments-card/attachments-card"
import {
  LifecycleCard,
  type LifecycleStage,
} from '@/components/detail/lifecycle-card/lifecycle-card';

import {
  useTask,
  useUpdateTask,
  // useAddTaskComment
} from '@/hooks/useTasks';
import { useToggleTimer } from '@/hooks/useTimeTracking';
// ATENÇÃO: Importe o seu hook real que busca os usuários do banco
import { useUsers } from '@/hooks/useUsers';

import styles from './Task.module.css';
import { TaskStatus, type EnumTaskStatus } from '@lib/shared';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog"
// import { Progress } from "@/components/ui/progress/progress"
// import { Popover, PopoverTrigger } from "@/components/ui/popover/popover"
// import { format } from "date-fns"
// import { ptBR } from "date-fns/locale"

const statusConfig: Record<
  EnumTaskStatus,
  { label: string; dotColor: string }
> = {
  BACKLOG: { label: 'Backlog', dotColor: styles.bgSlate },
  PENDING: { label: 'Pendente', dotColor: styles.bgBlue },
  IN_PROGRESS: { label: 'Em Andamento', dotColor: styles.bgAmber },
  IN_REVIEW: { label: 'Em Revisão', dotColor: styles.bgViolet },
  COMPLETED: { label: 'Concluído', dotColor: styles.bgEmerald },
  ARCHIVED: { label: 'Arquivado', dotColor: styles.bgSlate },
};

// Filtramos para não mostrar Concluído e Arquivado na barra de passos do Stepper
const activeStages: LifecycleStage[] = Object.entries(statusConfig)
  .filter(([id]) => id !== 'COMPLETED' && id !== 'ARCHIVED')
  .map(([id, { label, dotColor }]) => ({
    id,
    label,
    dotColor,
  }));

// const taskStatusBadge: Record<string, string> = {
//   backlog: styles.badgeBacklog,
//   todo: styles.badgeTodo,
//   in_progress: styles.badgeInProgress,
//   review: styles.badgeReview,
//   done: styles.badgeDone,
// }

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
};

// const initialSubtasks = [
//   { id: 1, title: "Criar schema de autenticacao", done: true },
//   { id: 2, title: "Implementar middleware JWT", done: true },
//   { id: 3, title: "Testes de integracao", done: true },
//   { id: 4, title: "Revisar e documentar endpoints", done: false },
// ]

// const initialAttachments = [
//   { name: "auth-flow-diagram.png", size: "1.2 MB" },
//   { name: "api-spec-v2.pdf", size: "340 KB" },
// ]

// const initialTimeline = [
//   { user: "Fernando D.", action: "mudou o status para Codificando", time: "2h atras", initials: "FD" },
//   { user: "Maria S.", action: "comentou: 'Boa abordagem no middleware!'", time: "4h atras", initials: "MS" },
//   { user: "Carlos R.", action: "anexou auth-flow-diagram.png", time: "1 dia atras", initials: "CR" },
//   { user: "Fernando D.", action: "criou esta tarefa", time: "3 dias atras", initials: "FD" },
// ]

// const chatMessages = [
//   { user: "Maria S.", initials: "MS", message: "Fernando, a abordagem com JWT refresh tokens esta otima. So uma duvida sobre o tempo de expiracao.", time: "4h atras" },
//   { user: "Fernando D.", initials: "FD", message: "Obrigado Maria! Estou usando 15min para access e 7 dias para refresh. O que acha?", time: "3h atras" },
//   { user: "Carlos R.", initials: "CR", message: "Adicionei o diagrama do fluxo atualizado. Confere se esta alinhado com a implementacao.", time: "2h atras" },
// ]

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();

  const activeTaskId = taskId;

  const { data: task, isLoading: isLoadingTask } = useTask(activeTaskId!);
  const { mutateAsync: updateTask, isPending: isUpdatingTask } =
    useUpdateTask();
  // const { mutateAsync: addComment } = useAddTaskComment()
  const toggleTimerMutation = useToggleTimer();

  // Busca os usuários reais do banco de dados
  const { data: allUsersResponse } = useUsers();
  const allUsers: any[] = allUsersResponse?.data || [];

  const [editingDescription, setEditingDescription] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');

  // const [subtasks, setSubtasks] = useState(initialSubtasks)
  // const [newSubtask, setNewSubtask] = useState("")
  // const [assignee, setAssignee] = useState("FD")
  // const [timeline, setTimeline] = useState(initialTimeline)

  useEffect(() => {
    if (editingDescription && task) {
      setDraftDescription(task.description || '');
    }
  }, [editingDescription, task]);

  // const [deadline, setDeadline] = useState<Date>(new Date("2026-09-30"))
  // const [editingDeadline, setEditingDeadline] = useState(false)

  // useEffect(() => {
  //   if (project?.dueDate) {
  //     setDeadline(new Date(project.dueDate) || new Date("0000-00-00"))
  //   }
  // }, [project?.dueDate])

  // const completedTasks = subtasks.filter((t) => t.done).length
  // const progressPercent = subtasks.length ? Math.round((completedTasks / subtasks.length) * 100) : 0

  // const daysLeft = Math.max(
  //   0,
  //   Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  // )

  // async function saveDescription() {
  //   try {
  //     // await updateProject({
  //     //   id: activeProjectId,
  //     //   data: {
  //     //     description: draftDescription
  //     //   }
  //     // })
  //     setEditingDescription(false)
  //     toast.success("Descrição atualizada com sucesso")
  //   } catch (error) {
  //     toast.error("Erro ao atualizar a descrição")
  //   }
  // }

  // const completedSubtasks = subtasks.filter((s) => s.done).length
  // const progressPercent = subtasks.length ? Math.round((completedSubtasks / subtasks.length) * 100) : 0
  // const pendingSubtasks = subtasks.length - completedSubtasks
  // const currentStage = taskStages.find((s) => s.id === status) ?? taskStages[2]

  // const lifecyclePeople = [
  //   { initials: "FD", name: "Fernando D." },
  //   { initials: "MS", name: "Maria S." },
  //   { initials: "CR", name: "Carlos R." },
  //   { initials: "AL", name: "Ana L." },
  //   ...availableMembers,
  // ]

  // function handleTransition(details: {
  //   to: { label: string }
  //   review: string
  //   assignee: string
  //   isFinish: boolean
  // }) {
  //   const person = lifecyclePeople.find((p) => p.initials === details.assignee)
  //   if (details.assignee) setAssignee(details.assignee)
  //   const action = details.isFinish
  //     ? `finalizou a tarefa${person ? ` e atribuiu a entrega a ${person.name}` : ""}`
  //     : `avancou a tarefa para ${details.to.label}${person ? ` e atribuiu a ${person.name}` : ""}`
  //   const entries = [{ user: "Voce", action, time: "agora", initials: "VC" }]
  //   if (details.review) {
  //     entries.push({ user: "Voce", action: `registrou: "${details.review}"`, time: "agora", initials: "VC" })
  //   }
  //   setTimeline((prev) => [...entries, ...prev])
  // }

  async function saveDescription() {
    try {
      await updateTask({
        id: activeTaskId!,
        data: { description: draftDescription },
      });
      setEditingDescription(false);
      toast.success('Descrição atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar a descrição');
    }
  }

  // function toggleSubtask(id: number) {
  //   setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)))
  // }

  // function addSubtask() {
  //   const title = newSubtask.trim()
  //   if (!title) return
  //   setSubtasks((prev) => [...prev, { id: Date.now(), title, done: false }])
  //   setNewSubtask("")
  //   toast.success("Subtarefa adicionada")
  // }

  // function removeSubtask(id: number) {
  //   setSubtasks((prev) => prev.filter((s) => s.id !== id))
  // }

  async function addMember(user: { id: string; name: string }) {
    const currentMemberIds =
      task?.members?.map((member: any) => member.userId) || [];

    if (currentMemberIds.includes(user.id)) return;

    try {
      await updateTask({
        id: activeTaskId!,
        data: {
          memberIds: [...currentMemberIds, user.id],
        },
      });
      toast.success(`${user.name} adicionado à tarefa`);
    } catch (error) {
      toast.error('Erro ao adicionar membro');
    }
  }

  // function handleShare() {
  //   const url = typeof window !== "undefined" ? window.location.href : `/tarefas/${activeTaskId}`
  //   if (typeof navigator !== "undefined" && navigator.clipboard) {
  //     navigator.clipboard.writeText(url).then(
  //       () => toast.success("Link copiado para a area de transferencia"),
  //       () => toast.error("Nao foi possivel copiar o link"),
  //     )
  //   } else {
  //     toast.success("Link copiado", { description: url })
  //   }
  // }

  // const totalMinutes = task.totalMinutes || 0
  // const formattedTotalTime = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`

  // Helpers para as iniciais
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoadingTask) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  // Blinda o componente. Daqui para baixo, "task" é 100% garantido de existir
  if (!task) {
    return (
      <div className={styles.container}>
        <p className={styles.textMuted}>Tarefa não encontrada.</p>
      </div>
    );
  }

  const taskOwner = allUsers?.find((u) => u.id === task.ownerId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/tasks">
              <ArrowLeft className={styles.iconSm} />
            </Link>
          </Button>
          <div>
            <div className={styles.badgesContainer}>
              <span className={styles.taskId}>{task.id.split('-')[0]}</span>
              <Badge
                className={[
                  styles.badge,
                  statusConfig[task.status as EnumTaskStatus].dotColor,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {statusConfig[task.status as EnumTaskStatus].label}
              </Badge>
              <Badge variant="outline" className={styles.badgeOutline}>
                {task.priority
                  ? priorityLabels[task.priority] || task.priority
                  : 'Normal'}
              </Badge>
              {task.isTimerActive && (
                <Badge variant="secondary" className={styles.badgeTimer}>
                  <Clock className={styles.iconXsRightSmall} /> Timer Ativo
                </Badge>
              )}
            </div>
            <h1 className={styles.taskTitle}>{task.title || 'Sem título'}</h1>
          </div>
        </div>
        <div className={styles.headerRight}>
          <RegisterHoursSheet
            taskId={activeTaskId}
            trigger={
              <Button variant="outline" size="sm">
                <Clock className={styles.iconXsRight} />
                Registrar Tempo
              </Button>
            }
          />
          {/* <Button variant="ghost" size="icon" className={styles.btnIcon} onClick={handleShare}>
            <Share2 className={styles.iconSm} />
          </Button>
          <Button variant="ghost" size="icon" className={styles.btnIcon} onClick={() => toast.info("Tarefa arquivada")}>
            <Archive className={styles.iconSm} />
          </Button> */}
        </div>
      </div>

      <div className={styles.metricsGrid}>
        {/* <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricCardTitle}>Progresso</CardTitle>
            <TrendingUp className={styles.metricCardIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>{progressPercent}%</div>
            <Progress value={progressPercent} className={styles.progressEmerald} />
            <p className={styles.metricSubtitle}>
              {completedTasks} de {subtasks.length} subtarefas
            </p>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricCardTitle}>Prazo</CardTitle>
            <Popover open={editingDeadline} onOpenChange={setEditingDeadline}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={styles.btnSmallIcon}>
                  <Pencil className={styles.iconXs} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className={styles.calendarContent} align="end">
                <CalendarPicker
                  mode="single"
                  selected={deadline}
                  onSelect={async (d) => {
                    if (d) {
                      setDeadline(d)
                      setEditingDeadline(false)
                      try {
                        await updateProject({ id: activeProjectId, data: { dueDate: d } })
                        toast.success("Prazo atualizado")
                      } catch (e) {
                        toast.error("Erro ao atualizar o prazo")
                      }
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>{daysLeft} dias</div>
            <p className={styles.metricSubtitle}>
              Entrega em {format(deadline, "dd 'de' MMM yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card> */}

        {/* Card Equipe Descomentado e Ajustado */}
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricCardTitle}>
              Equipe da Tarefa
            </CardTitle>
            {/* <Calendar className={styles.metricCardIcon} /> */}
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>
              {task?.members?.length || 0}
            </div>
            <p className={styles.metricSubtitle}>membros ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.column}>
          <Card>
            <CardHeader>
              <div className={styles.header}>
                <CardTitle className={styles.cardTitle}>Descrição</CardTitle>
                {!editingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDescription(true)}
                  >
                    <Pencil className={styles.iconXsRight} />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingDescription ? (
                <div className={styles.descEditContainer}>
                  <Textarea
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    className={styles.descTextarea}
                    placeholder="Adicione uma descrição detalhada da tarefa..."
                  />
                  <div className={styles.descActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDescription(false)}
                      disabled={isUpdatingTask}
                    >
                      <X className={styles.iconXsRight} />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveDescription}
                      disabled={isUpdatingTask}
                    >
                      {isUpdatingTask ? (
                        <Loader2
                          className={`${styles.iconXsRight} ${styles.animateSpin}`}
                        />
                      ) : (
                        <Check className={styles.iconXsRight} />
                      )}
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className={styles.descText}>
                  {task.description || 'Nenhuma descrição fornecida.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <div className={styles.header}>
                <CardTitle className={styles.cardTitle}>Checklist de Subtarefas</CardTitle>
                <span className={styles.subtaskProgressText}>{completedSubtasks} de {subtasks.length} - {progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className={styles.progressBar} />
            </CardHeader>
            <CardContent className={styles.subtasksList}>
              {subtasks.map((sub) => (
                <div key={sub.id} className={styles.subtaskItem}>
                  <Checkbox checked={sub.done} onCheckedChange={() => toggleSubtask(sub.id)} />
                  <span className={[styles.subtaskLabel, sub.done ? styles.subtaskLabelDone : ''].filter(Boolean).join(' ')}>
                    {sub.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={styles.subtaskDeleteBtn}
                    onClick={() => removeSubtask(sub.id)}
                  >
                    <Trash2 className={styles.iconXs} />
                    <span className="sr-only">Remover subtarefa</span>
                  </Button>
                </div>
              ))}
              <div className={styles.subtaskAddContainer}>
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      e.preventDefault()
                      addSubtask()
                    }
                  }}
                  placeholder="Adicionar subtarefa..."
                  className={styles.subtaskInput}
                />
                <Button size="sm" onClick={addSubtask} disabled={!newSubtask.trim()}>
                  <Plus className={styles.iconXsRight} />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* <AttachmentsCard initialAttachments={initialAttachments} /> */}
        </div>

        <div className={styles.column}>
          <LifecycleCard
            taskId={activeTaskId}
            stages={activeStages}
            status={task.status as EnumTaskStatus}
            isTimerActive={task.isTimerActive || false}
            hasPendingSessions={task.hasPendingSessions || false}
            alreadyApointed={task.totalMinutes > 0 || false}
            onToggleTimer={() => toggleTimerMutation.mutate(task.id)}
            isTimerPending={toggleTimerMutation.isPending}
            onStatusChange={() => {}}
            onTransition={async (details) => {
              try {
                const targetStatusId = details.isFinish
                  ? TaskStatus.Completed
                  : details.to.id;

                await updateTask({
                  id: activeTaskId!,
                  data: { status: targetStatusId as EnumTaskStatus },
                });

                if (details.review && details.review.trim().length > 0) {
                  // await addComment({
                  //   taskId: activeTaskId,
                  //   data: { text: details.review, type: "STATUS_TRANSITION" }
                  // });
                }
              } catch (error) {
                toast.error('Erro ao atualizar o status');
              }
            }}
            entityLabel="tarefa"
            finishPermission={
              task.status !== TaskStatus.Completed &&
              task.status !== TaskStatus.Archived &&
              task.status === TaskStatus.InReview
            }
            // people={lifecyclePeople}
            // currentAssignee={assignee}
            // onTransition={handleTransition}
            // finishWarning={
            //   pendingSubtasks > 0
            //     ? `Existem ${pendingSubtasks} subtarefa(s) pendente(s). Deseja finalizar mesmo assim? A tarefa sera marcada como concluida.`
            //     : null
            // }
          />

          <Card>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>Pessoas</CardTitle>
            </CardHeader>
            <CardContent className={styles.peopleContent}>
              <div>
                <p className={styles.sectionLabel}>Responsável (Owner)</p>
                <div className={styles.headerLeft}>
                  <Avatar className={styles.avatarLg}>
                    <AvatarFallback className={styles.avatarFallbackLg}>
                      {getInitials(taskOwner?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={styles.personName}>
                      {taskOwner?.name || 'Carregando...'}
                    </p>
                    <p className={styles.personEmail}>
                      {taskOwner?.email || task?.ownerId}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <div className={styles.membersHeader}>
                  <p className={styles.sectionLabel}>Membros</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.addMemberBtn}
                        disabled={isUpdatingTask}
                      >
                        {isUpdatingTask ? (
                          <Loader2
                            className={`${styles.iconAddMember} ${styles.animateSpin}`}
                          />
                        ) : (
                          <UserPlus className={styles.iconAddMember} />
                        )}
                        Adicionar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Adicionar membro</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {allUsers.filter(
                        (u) =>
                          !task?.members?.some((tm: any) => tm.userId === u.id),
                      ).length === 0 && (
                        <DropdownMenuItem disabled>
                          Nenhum disponível
                        </DropdownMenuItem>
                      )}

                      {allUsers
                        .filter(
                          (u) =>
                            !task?.members?.some(
                              (tm: any) => tm.userId === u.id,
                            ),
                        )
                        .map((u) => (
                          <DropdownMenuItem
                            key={u.id}
                            onClick={() => addMember(u)}
                          >
                            <Avatar className={styles.avatarSm}>
                              <AvatarFallback
                                className={styles.avatarFallbackSm}
                              >
                                {getInitials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            {u.name}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className={styles.membersList}>
                  {task?.members?.map((member: any) => {
                    const matchedUser = allUsers.find(
                      (u) => u.id === member.userId,
                    );
                    return (
                      <Avatar
                        key={member.userId}
                        className={`${styles.avatarLg} ${styles.avatarBordered}`}
                        title={matchedUser?.name || `User ID: ${member.userId}`}
                      >
                        <AvatarFallback className={styles.avatarFallbackSm}>
                          {getInitials(matchedUser?.name)}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader><CardTitle className={styles.cardTitle}>Tempo</CardTitle></CardHeader>
            <CardContent>
              <p className={styles.timeTotal}>{formattedTotalTime}</p>
              <p className={styles.timeSubtitle}>Tempo total investido</p>
              
              <div className={styles.timeList}>
                {[
                  { label: "Codificando", hours: "18h 30m", color: styles.bgBlue },
                  { label: "Em Revisao", hours: "5h 15m", color: styles.bgAmber },
                  { label: "Reunioes", hours: "4h 00m", color: styles.bgViolet },
                ].map((item) => (
                  <div key={item.label} className={styles.timeItem}>
                    <div className={styles.headerLeft}>
                      <div className={`${styles.timeDot} ${item.color}`} />
                      <span className={styles.textMuted}>{item.label}</span>
                    </div>
                    <span className={styles.timeValue}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}

          {/* <Card>
            <Tabs defaultValue="activity">
              <CardHeader className={styles.tabsHeader}>
                <TabsList className={styles.tabsList}>
                  <TabsTrigger value="activity" className={styles.tabsTrigger}>Atividade</TabsTrigger>
                  <TabsTrigger value="chat" className={styles.tabsTrigger}>Chat</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className={styles.tabsContent}>
                <TabsContent value="activity" className={styles.tabPanel}>
                  <ScrollArea className={styles.scrollAreaActivity}>
                    <div className={styles.activityList}>
                      {timeline.map((event, i) => (
                        <div key={i} className={styles.activityItem}>
                          <div className={styles.activityTimeline}>
                            <Avatar className={styles.avatarActivity}>
                              <AvatarFallback className={styles.avatarFallbackSm}>{event.initials}</AvatarFallback>
                            </Avatar>
                            {i < timeline.length - 1 && <div className={styles.activityLine} />}
                          </div>
                          <div className={styles.activityContent}>
                            <p className={styles.textSm}>
                              <span className={styles.activityUser}>{event.user}</span>{" "}
                              <span className={styles.textMuted}>{event.action}</span>
                            </p>
                            <p className={styles.activityTime}>{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="chat" className={styles.tabPanel}>
                  <ScrollArea className={styles.scrollAreaChat}>
                    <div className={styles.activityList}>
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={styles.chatItem}>
                          <Avatar className={`${styles.avatarActivity} ${styles.shrink0}`}>
                            <AvatarFallback className={styles.avatarFallbackSm}>{msg.initials}</AvatarFallback>
                          </Avatar>
                          <div className={styles.chatBubble}>
                            <p className={styles.chatUser}>{msg.user}</p>
                            <p className={styles.chatMessage}>{msg.message}</p>
                            <p className={styles.chatTime}>{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className={styles.chatInputContainer}>
                    <Input placeholder="Escreva uma mensagem..." className={styles.chatInput} />
                    <Button size="icon" className={`${styles.btnIcon} ${styles.shrink0}`}>
                      <Send className={styles.iconXs} />
                    </Button>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
