import { useState } from 'react';
import {
  Check,
  ChevronRight,
  Flag,
  CircleDot,
  UserRound,
  Play,
  Pause,
  Square,
  ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card/card';
import { Label } from '@/components/ui/label/label';
import { Textarea } from '@/components/ui/textarea/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip/tooltip';
import { RegisterHoursSheet } from '@/components/forms/register-hours-sheet/register-hours-sheet';

import styles from './LifecycleCard.module.css';

export interface LifecycleStage {
  id: string;
  label: string;
  dotColor?: string;
}

export interface LifecyclePerson {
  initials: string;
  name: string;
}

export interface TransitionDetails {
  from: LifecycleStage;
  to: LifecycleStage;
  review: string;
  assignee: string;
  isFinish: boolean;
}

interface LifecycleCardProps {
  taskId?: string;
  title?: string;
  stages: LifecycleStage[];
  status: string;
  isTimerActive?: boolean;
  hasPendingSessions?: boolean;
  isTimerPending?: boolean;
  alreadyApointed?: boolean;
  onToggleTimer?: () => void;
  onStatusChange: (id: string) => void;
  entityLabel: string;
  finishWarning?: string | null;
  finishPermission?: boolean;
  people?: LifecyclePerson[];
  currentAssignee?: string;
  onTransition?: (details: TransitionDetails) => void;
}

export function LifecycleCard({
  taskId,
  title = 'Ciclo de vida',
  stages,
  status,
  isTimerActive = false,
  hasPendingSessions = false,
  isTimerPending = false,
  alreadyApointed = false,
  onToggleTimer,
  onStatusChange,
  entityLabel,
  finishWarning,
  finishPermission,
  people = [],
  currentAssignee,
  onTransition,
}: LifecycleCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<'advance' | 'finish'>('advance');
  const [review, setReview] = useState('');
  const [assignee, setAssignee] = useState(currentAssignee ?? '');

  const currentIndex = stages.findIndex((s) => s.id === status);
  const currentStage = stages[currentIndex] ?? stages[0];

  // O último stage do array visual de etapas
  const lastVisualStage = stages[stages.length - 1];

  // A tarefa só é considerada finalizada pelo status dela real
  const isFinished = status === 'COMPLETED' || status === 'ARCHIVED';

  // Lógica inteligente para o próximo estágio:
  // Se estiver em "PENDING" e já tiver apontamentos, pula direto para "IN_REVIEW" (índice 3), senão segue o fluxo normal (+1)
  let nextStage: LifecycleStage | undefined = undefined;
  if (currentIndex >= 0 && currentIndex < stages.length - 1) {
    if (status === 'PENDING' && alreadyApointed) {
      // Procura o estágio de revisão no array (ex: id === "IN_REVIEW")
      nextStage =
        stages.find((s) => s.id === 'IN_REVIEW') || stages[currentIndex + 1];
    } else {
      nextStage = stages[currentIndex + 1];
    }
  }

  // Se o mode for finish, o target é fictício pois enviamos uma flag isFinish no payload
  const targetStage = mode === 'finish' ? lastVisualStage : nextStage;

  function openDialog(nextMode: 'advance' | 'finish') {
    setMode(nextMode);
    setReview('');
    setAssignee(currentAssignee ?? '');
    setDialogOpen(true);
  }

  function confirmTransition() {
    if (!targetStage && mode !== 'finish') return;
    const isFinish = mode === 'finish';

    if (!isFinish && targetStage) {
      onStatusChange(targetStage.id);
    }

    onTransition?.({
      from: currentStage,
      to: targetStage || currentStage,
      review: review.trim(),
      assignee,
      isFinish,
    });

    setDialogOpen(false);

    if (isFinish) {
      toast.success(
        `${entityLabel[0].toUpperCase()}${entityLabel.slice(1)} finalizada com sucesso!`,
      );
    } else if (targetStage) {
      toast.success(`Etapa avançada para ${targetStage.label}`);
    }
  }

  const assigneePerson = people.find((p) => p.initials === assignee);

  // Lógica dos Botões
  const showTimerControls =
    status === 'PENDING' ||
    status === 'IN_PROGRESS' ||
    isTimerActive ||
    hasPendingSessions;
  const showDefaultAdvanceButton =
    status !== 'PENDING' || (alreadyApointed && nextStage);

  return (
    <Card>
      <CardHeader className={styles.cardHeader}>
        <CardTitle className={styles.cardTitle}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.cardContent}>
        <ol className={styles.stepperList}>
          {stages.map((stage, i) => {
            const done = isFinished || i < currentIndex;
            const active = !isFinished && i === currentIndex;
            return (
              <li key={stage.id} className={styles.stepperItem}>
                <div className={styles.stepIconContainer}>
                  <span
                    className={[
                      styles.stepDot,
                      done
                        ? styles.stepDotDone
                        : active
                          ? styles.stepDotActive
                          : styles.stepDotPending,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {done ? (
                      <Check className={styles.stepIcon} />
                    ) : active ? (
                      <CircleDot className={styles.stepIcon} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  {i < stages.length - 1 && (
                    <span
                      className={[
                        styles.stepLine,
                        done ? styles.stepLineDone : styles.stepLinePending,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  )}
                </div>
                <div
                  className={[
                    styles.stepTextContainer,
                    active ? styles.stepTextActive : styles.stepTextPending,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <p
                    className={[
                      styles.stepLabel,
                      active ? styles.stepLabelActive : styles.stepLabelPending,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {stage.label}
                  </p>
                  {active && (
                    <p className={styles.stepCurrentHint}>Etapa atual</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {isFinished ? (
          <div className={styles.finishedAlert}>
            <Check className={styles.finishedIcon} />
            Tarefa {status === 'ARCHIVED' ? 'Arquivada' : 'Finalizada'}
          </div>
        ) : (
          <div className={styles.actionsWrapper}>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {/* Botões do Cronômetro */}
              {showTimerControls && taskId && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={onToggleTimer}
                          disabled={isTimerPending}
                          className={[
                            styles.timerBtn,
                            isTimerActive
                              ? styles.timerBtnPause
                              : styles.timerBtnPlay,
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
                        {isTimerActive ? 'Pausar tarefa' : 'Iniciar tarefa'}
                      </TooltipContent>
                    </Tooltip>

                    {!isTimerActive && hasPendingSessions && (
                      <RegisterHoursSheet
                        taskId={taskId}
                        trigger={
                          <button
                            type="button"
                            className={[
                              styles.timerBtn,
                              styles.timerBtnStop,
                            ].join(' ')}
                          >
                            <Square className={styles.timerIcon} />
                          </button>
                        }
                      />
                    )}
                  </TooltipProvider>
                </div>
              )}

              {/* Botão de Avançar Padrão para os outros status */}
              {showDefaultAdvanceButton && nextStage && (
                <Button
                  variant="outline"
                  size="sm"
                  className={styles.advanceButton}
                  onClick={() => openDialog('advance')}
                >
                  {`Avançar para ${nextStage.label}`}
                  <ChevronsRight className={styles.advanceIcon} />
                </Button>
              )}
            </div>

            {/* Botão de Concluir Tarefa */}
            {finishPermission && (
              <Button
                size="sm"
                className={styles.finishButton}
                onClick={() => openDialog('finish')}
              >
                <Flag className={styles.finishButtonIcon} />
                Concluir
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'finish'
                ? `Finalizar ${entityLabel}`
                : `Avançar para ${targetStage?.label ?? ''}`}
            </DialogTitle>
            <DialogDescription>
              {mode === 'finish' && finishWarning
                ? finishWarning
                : `Revise o que aconteceu na etapa "${currentStage.label}" e defina o responsável pela etapa seguinte.`}
            </DialogDescription>
          </DialogHeader>

          <div className={styles.dialogBody}>
            {mode === 'advance' && targetStage && (
              <div className={styles.transitionSummary}>
                <span className={styles.summaryStage}>
                  <span
                    className={[styles.summaryDot, currentStage.dotColor]
                      .filter(Boolean)
                      .join(' ')}
                  />
                  {currentStage.label}
                </span>
                <ChevronRight className={styles.summaryArrow} />
                <span className={styles.summaryStageTarget}>
                  <span
                    className={[
                      styles.summaryDot,
                      targetStage.dotColor ?? styles.summaryDotFallback,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                  {targetStage.label}
                </span>
              </div>
            )}

            <div className={styles.formGroup}>
              <Label htmlFor="lifecycle-review">
                O que aconteceu nesta etapa?
              </Label>
              <Textarea
                id="lifecycle-review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={`Resumo do que foi feito em "${currentStage.label}"...`}
                rows={3}
              />
            </div>

            {people.length > 0 && (
              <div className={styles.formGroup}>
                <Label htmlFor="lifecycle-assignee">
                  {mode === 'finish'
                    ? 'Responsável pela entrega'
                    : `Responsável por "${targetStage?.label ?? ''}"`}
                </Label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger id="lifecycle-assignee">
                    <SelectValue placeholder="Selecione uma pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((p) => (
                      <SelectItem key={p.initials} value={p.initials}>
                        <span className={styles.selectItemWrapper}>
                          <Avatar className={styles.avatar}>
                            <AvatarFallback className={styles.avatarFallback}>
                              {p.initials}
                            </AvatarFallback>
                          </Avatar>
                          {p.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {assigneePerson && (
              <p className={styles.assigneeHint}>
                <UserRound className={styles.assigneeHintIcon} />
                {assigneePerson.name} assumirá a etapa
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className={mode === 'finish' ? styles.finishButton : ''}
              onClick={confirmTransition}
            >
              {mode === 'finish'
                ? 'Confirmar finalização'
                : 'Confirmar e avançar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
