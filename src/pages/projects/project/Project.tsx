// import { useState, useEffect } from "react"
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  // Share2,
  // Archive,
  // Send,
  // Plus,
  // Pencil,
  // Check,
  // X,
  UserPlus,
  // Trash2,
  // TrendingUp,
  Calendar,
  Loader2,
} from 'lucide-react';
// import { format } from "date-fns"
// import { ptBR } from "date-fns/locale"
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar/avatar';
// import { Input } from "@/components/ui/input/input"
// import { Textarea } from "@/components/ui/textarea/textarea"
import { Separator } from '@/components/ui/separator/separator';
// import { ScrollArea } from "@/components/ui/scroll-area/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu/dropdown-menu';
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover/popover"
// import { Calendar as CalendarPicker } from "@/components/ui/calendar/calendar"
import { RegisterHoursSheet } from '@/components/forms/register-hours-sheet/register-hours-sheet';
import { NewTaskDialog } from '@/components/forms/new-task-dialog/new-task-dialog';
// import { AttachmentsCard } from "@/components/detail/attachments-card/attachments-card"
// import { LifecycleCard, type LifecycleStage } from "@/components/detail/lifecycle-card/lifecycle-card"
import { type LifecycleStage } from '@/components/detail/lifecycle-card/lifecycle-card';

import { useProject, useUpdateProject } from '@/hooks/useProjects';
// ATENÇÃO: Importe o seu hook real que busca os usuários do banco
import { useUsers } from '@/hooks/useUsers';
import styles from './Project.module.css';

const projectStages: LifecycleStage[] = [
  { id: 'planning', label: 'Planejamento', dotColor: styles.bgViolet },
  { id: 'active', label: 'Em Andamento', dotColor: styles.bgAmber },
  { id: 'review', label: 'Revisao Final', dotColor: styles.bgBlue },
  { id: 'completed', label: 'Concluido', dotColor: styles.bgEmerald },
];

const projectStatusBadge: Record<string, string> = {
  planning: styles.badgePlanning,
  active: styles.badgeActive,
  review: styles.badgeReview,
  completed: styles.badgeCompleted,
};

// const defaultDescription =
//   "Reestruturacao completa da plataforma com foco em performance, escalabilidade e experiencia do usuario. O projeto abrange a migracao da arquitetura para microservicos, a criacao de um novo design system e a integracao com provedores externos de pagamento e autenticacao."

// const initialTasks = [
//   { id: 1, title: "Levantamento de requisitos", done: true },
//   { id: 2, title: "Definir arquitetura e stack", done: true },
//   { id: 3, title: "Implementar design system", done: true },
//   { id: 4, title: "Desenvolver modulos principais", done: false },
//   { id: 5, title: "Testes de integracao e QA", done: false },
// ]

// const initialTimeline = [
//   { user: "Fernando D.", action: "avancou o projeto para Em Andamento", time: "1h atras", initials: "FD" },
//   { user: "Julia M.", action: "concluiu a tarefa 'Implementar design system'", time: "5h atras", initials: "JM" },
//   { user: "Ana L.", action: "anexou brief-do-cliente.pdf", time: "1 dia atras", initials: "AL" },
//   { user: "Fernando D.", action: "criou este projeto", time: "8 dias atras", initials: "FD" },
// ]

// const chatMessages = [
//   { user: "Julia M.", initials: "JM", message: "Pessoal, o design system esta pronto para revisao. Deem uma olhada nos tokens novos.", time: "5h atras" },
//   { user: "Fernando D.", initials: "FD", message: "Otimo trabalho Julia! Vou comecar a integrar nos modulos principais.", time: "4h atras" },
//   { user: "Ana L.", initials: "AL", message: "Anexei o brief atualizado do cliente com os ajustes de escopo.", time: "1 dia atras" },
// ]

// const initialAttachments = [
//   { name: "brief-do-cliente.pdf", size: "820 KB" },
//   { name: "arquitetura-v2.png", size: "1.5 MB" },
// ]

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const activeProjectId = projectId || '';

  const { data: project, isLoading: isLoadingProject } =
    useProject(activeProjectId);

  const { mutateAsync: updateProject, isPending: isUpdatingProject } =
    useUpdateProject();

  // Busca os usuários reais do banco de dados
  const { data: allUsersResponse } = useUsers();
  // Ajuste isso dependendo de como o seu DTO de paginação de usuários retorna (ex: allUsersResponse.data)
  const allUsers: any[] = allUsersResponse?.data || [];

  const projectName = project?.name || 'Design System v2.0';

  // const [editingDescription, setEditingDescription] = useState(false)
  // const [draftDescription, setDraftDescription] = useState(defaultDescription)

  // const [tasks, setTasks] = useState(initialTasks)
  // const [newTask, setNewTask] = useState("")

  // const [status, setStatus] = useState("active")
  // const [assignee, setAssignee] = useState("FD")

  // const [timeline, setTimeline] = useState(initialTimeline)

  // const [deadline, setDeadline] = useState<Date>(new Date("2026-09-30"))
  // const [editingDeadline, setEditingDeadline] = useState(false)

  // useEffect(() => {
  //   if (editingDescription) {
  //     setDraftDescription(project?.description || defaultDescription)
  //   }
  // }, [editingDescription, project?.description])

  // useEffect(() => {
  //   if (project?.dueDate) {
  //     setDeadline(new Date(project.dueDate) || new Date("0000-00-00"))
  //   }
  // }, [project?.dueDate])

  // const lifecyclePeople = [
  //   { initials: "FD", name: "Fernando D." },
  //   { initials: "JM", name: "Julia M." },
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
  //     ? `finalizou o projeto${person ? ` e atribuiu a entrega a ${person.name}` : ""}`
  //     : `avancou o projeto para ${details.to.label}${person ? ` e atribuiu a ${person.name}` : ""}`
  //   const entries = [{ user: "Voce", action, time: "agora", initials: "VC" }]
  //   if (details.review) {
  //     entries.push({ user: "Voce", action: `registrou: "${details.review}"`, time: "agora", initials: "VC" })
  //   }
  //   setTimeline((prev) => [...entries, ...prev])
  // }

  // const completedTasks = tasks.filter((t) => t.done).length
  // const progressPercent = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
  // const pendingTasks = tasks.length - completedTasks

  const status = 'active'; // Fixado enquanto a lógica de status original estiver comentada
  const currentStage =
    projectStages.find((s) => s.id === status) ?? projectStages[1];

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

  // function toggleTask(id: number) {
  //   setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  // }

  // function addTask() {
  //   const title = newTask.trim()
  //   if (!title) return
  //   setTasks((prev) => [...prev, { id: Date.now(), title, done: false }])
  //   setNewTask("")
  //   toast.success("Tarefa adicionada")
  // }

  // function removeTask(id: number) {
  //   setTasks((prev) => prev.filter((t) => t.id !== id))
  // }

  async function addMember(user: { id: string; name: string }) {
    const currentMemberIds =
      project?.members?.map((member: any) => member.userId) || [];

    if (currentMemberIds.includes(user.id)) return;

    try {
      await updateProject({
        id: activeProjectId,
        data: {
          memberIds: [...currentMemberIds, user.id],
        },
      });
      toast.success(`${user.name} adicionado ao projeto`);
    } catch (error) {
      toast.error('Erro ao adicionar membro');
    }
  }

  // function handleShare() {
  //   const url = typeof window !== "undefined" ? window.location.href : `/squad/projetos/${activeProjectId}`
  //   if (typeof navigator !== "undefined" && navigator.clipboard) {
  //     navigator.clipboard.writeText(url).then(
  //       () => toast.success("Link copiado para a area de transferencia"),
  //       () => toast.error("Nao foi possivel copiar o link"),
  //     )
  //   } else {
  //     toast.success("Link copiado", { description: url })
  //   }
  // }

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

  const projectOwner = allUsers?.find((u) => u.id === project?.ownerId);

  if (isLoadingProject) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/squad/projects">
              <ArrowLeft className={styles.iconSm} />
            </Link>
          </Button>
          <div>
            <div className={styles.badgesContainer}>
              <span className={styles.projectId}>
                {activeProjectId.split('-')[0] || activeProjectId}
              </span>
              <Badge
                className={[styles.badge, projectStatusBadge[status]]
                  .filter(Boolean)
                  .join(' ')}
              >
                {currentStage.label}
              </Badge>
            </div>
            <h1 className={styles.projectTitle}>{projectName}</h1>
          </div>
        </div>
        <div className={styles.headerRight}>
          <NewTaskDialog />
          <RegisterHoursSheet />
          {/* <Button variant="ghost" size="icon" className={styles.btnIcon} onClick={handleShare}>
            <Share2 className={styles.iconSm} />
          </Button>
          <Button variant="ghost" size="icon" className={styles.btnIcon} onClick={() => toast.info("Projeto arquivado")}>
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
              {completedTasks} de {tasks.length} tarefas
            </p>
          </CardContent>
        </Card>
        <Card>
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
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricCardTitle}>Equipe</CardTitle>
            <Calendar className={styles.metricCardIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>
              {project?.members?.length || 0}
            </div>
            <p className={styles.metricSubtitle}>membros ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className={styles.layoutGrid}>
        <div className={styles.column}>
          {/* <Card>
            <CardHeader>
              <div className={styles.header}>
                <CardTitle className={styles.cardTitle}>Descrição</CardTitle>
                {!editingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraftDescription(project?.description || defaultDescription)
                      setEditingDescription(true)
                    }}
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
                  />
                  <div className={styles.descActions}>
                    <Button variant="outline" size="sm" onClick={() => setEditingDescription(false)} disabled={isUpdatingProject}>
                      <X className={styles.iconXsRight} />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={saveDescription} disabled={isUpdatingProject}>
                      {isUpdatingProject ? (
                        <Loader2 className={`${styles.iconXsRight} ${styles.animateSpin}`} />
                      ) : (
                        <Check className={styles.iconXsRight} />
                      )}
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className={styles.descText}>{project?.description || defaultDescription}</p>
              )}
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardHeader>
              <div className={styles.header}>
                <CardTitle className={styles.cardTitle}>Lista de Tarefas</CardTitle>
                <span className={styles.progressText}>
                  {completedTasks} de {tasks.length} - {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} className={styles.progressEmeraldHeader} />
            </CardHeader>
            <CardContent className={styles.taskList}>
              {tasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} />
                  <span className={[styles.taskLabel, task.done ? styles.taskLabelDone : ''].filter(Boolean).join(' ')}>
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={styles.taskDeleteBtn}
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 className={styles.iconXs} />
                    <span className="sr-only">Remover tarefa</span>
                  </Button>
                </div>
              ))}
              <div className={styles.taskAddContainer}>
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      e.preventDefault()
                      addTask()
                    }
                  }}
                  placeholder="Adicionar tarefa..."
                  className={styles.taskInput}
                />
                <Button size="sm" onClick={addTask} disabled={!newTask.trim()}>
                  <Plus className={styles.iconXsRight} />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* <AttachmentsCard initialAttachments={initialAttachments} /> */}
        </div>

        <div className={styles.column}>
          {/* <LifecycleCard
            title="Ciclo de vida do projeto"
            stages={projectStages}
            status={status}
            onStatusChange={setStatus}
            entityLabel="projeto"
            people={lifecyclePeople}
            currentAssignee={assignee}
            onTransition={handleTransition}
            finishWarning={
              pendingTasks > 0
                ? `Existem ${pendingTasks} tarefa(s) pendente(s). Deseja finalizar o projeto mesmo assim? Ele sera marcado como concluido.`
                : null
            }
          /> */}

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
                      {getInitials(projectOwner?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={styles.personName}>
                      {projectOwner?.name || 'Carregando...'}
                    </p>
                    <p className={styles.personEmail}>
                      {projectOwner?.email || project?.ownerId}
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
                        disabled={isUpdatingProject}
                      >
                        {isUpdatingProject ? (
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
                          !project?.members?.some(
                            (pm: any) => pm.userId === u.id,
                          ),
                      ).length === 0 && (
                        <DropdownMenuItem disabled>
                          Nenhum disponível
                        </DropdownMenuItem>
                      )}

                      {allUsers
                        .filter(
                          (u) =>
                            !project?.members?.some(
                              (pm: any) => pm.userId === u.id,
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
                  {project?.members?.map((member: any) => {
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
              <p className={styles.timeTotal}>245h 00m</p>
              <p className={styles.timeSubtitle}>de 360h estimadas</p>
              <div className={styles.timeList}>
                {[
                  { label: "Desenvolvimento", hours: "168h 00m", color: styles.bgBlue },
                  { label: "Design", hours: "52h 30m", color: styles.bgPink },
                  { label: "Reunioes", hours: "24h 30m", color: styles.bgViolet },
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
