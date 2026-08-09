import { useMemo } from 'react';
import { Clock, Calendar, Pencil, Loader2 } from 'lucide-react';
import { startOfWeek, endOfWeek, isSameDay } from 'date-fns';

import { Button } from '@/components/ui/button/button';
import { RegisterHoursSheet } from '@/components/forms/register-hours-sheet/register-hours-sheet';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card/card';
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

import { useTimeLogs } from '@/hooks/useTimeTracking';
import styles from './Activities.module.css';

const natureColors: Record<string, string> = {
  DEV: styles.natureDev,
  CODE_REVIEW: styles.natureReview,
  MEETING: styles.natureMeeting,
  DESIGN: styles.natureDesign,
  BUG_FIX: styles.natureBug,
  DOCUMENTATION: styles.natureDoc,
  OTHER: styles.natureDefault,
};

const natureLabels: Record<string, string> = {
  DEV: 'Desenvolvimento',
  CODE_REVIEW: 'Revisão',
  MEETING: 'Reunião',
  DESIGN: 'Design',
  BUG_FIX: 'Bug Fix',
  DOCUMENTATION: 'Documentação',
  OTHER: 'Outros',
};

export default function ActivitiesPage() {
  // const [isTimerRunning, setIsTimerRunning] = useState(false)
  // const [timerTask, _setTimerTask] = useState("Refatorar modulo de auth")

  // Calcula o início e o fim da SEMANA atual (Começando na segunda-feira = 1)
  const weekStart = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
    [],
  );
  const weekEnd = useMemo(
    () => endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
    [],
  );

  // Busca os logs de tempo da semana inteira
  const { data: logsData, isLoading } = useTimeLogs(1, 100, weekStart, weekEnd);

  const weeklyLogs = logsData?.data || [];

  // Filtra os logs na memória para separar apenas os de HOJE
  const todayLogs = useMemo(() => {
    const today = new Date();
    return weeklyLogs.filter((log: any) =>
      isSameDay(new Date(log.date), today),
    );
  }, [weeklyLogs]);

  // Calcula os minutos (Hoje vs Semana)
  const todayMinutes = useMemo(() => {
    return todayLogs.reduce((acc, log) => acc + (log.loggedMinutes || 0), 0);
  }, [todayLogs]);

  const weekMinutes = useMemo(() => {
    return weeklyLogs.reduce((acc, log) => acc + (log.loggedMinutes || 0), 0);
  }, [weeklyLogs]);

  // Formata para horas
  const todayHours = (todayMinutes / 60).toFixed(1);
  const weekHours = (weekMinutes / 60).toFixed(1);

  const dailyGoal = 8.0;
  const weekGoal = 40.0;

  return (
    <div className={styles.container}>
      <div className={styles.flexBetween}>
        <div>
          <h1 className={styles.title}>Atividades</h1>
          <p className={styles.subtitle}>
            Registre horas e acompanhe sua produtividade
          </p>
        </div>
        <RegisterHoursSheet />
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Horas Hoje</CardTitle>
            <Clock className={styles.cardIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{todayHours}h</div>
            <Progress
              value={(Number(todayHours) / dailyGoal) * 100}
              className={styles.progressBar}
            />
            <p className={styles.statSubtitle}>
              {todayHours}h de {dailyGoal}h (
              {Math.round((Number(todayHours) / dailyGoal) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Horas na Semana</CardTitle>
            <Calendar className={styles.cardIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{weekHours}h</div>
            <Progress
              value={(Number(weekHours) / weekGoal) * 100}
              className={styles.progressBar}
            />
            <p className={styles.statSubtitle}>
              {weekHours}h de {weekGoal}h (
              {Math.round((Number(weekHours) / weekGoal) * 100)}%)
            </p>
          </CardContent>
        </Card>

        {/* <Card className={isTimerRunning ? styles.timerCardActive : ""}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Timer Ativo</CardTitle>
            <Target className={styles.cardIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.flexBetween}>
              <div>
                <p className={styles.statValueMono}>{isTimerRunning ? "01:23:45" : "00:00:00"}</p>
                <p className={styles.timerTaskName}>{timerTask}</p>
              </div>
              <Button
                size="icon"
                variant={isTimerRunning ? "destructive" : "default"}
                className={styles.timerButton}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <Pause className={styles.timerIcon} /> : <Play className={styles.timerIcon} />}
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={styles.tableCardTitle}>
            Registro de Atividades (Hoje)
          </CardTitle>
          <CardDescription>
            Histórico das suas horas consolidadas no dia atual
          </CardDescription>
        </CardHeader>
        <CardContent className={styles.tableCardContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Loader2 className={styles.spinner} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarefa</TableHead>
                  <TableHead className={styles.textRight}>Ações</TableHead>
                  <TableHead className={styles.tableHeadHidden}>
                    Projeto
                  </TableHead>
                  <TableHead>Natureza</TableHead>
                  <TableHead className={styles.tableHeadHidden}>
                    Horário
                  </TableHead>
                  <TableHead className={styles.textRight}>Horas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className={styles.textCenter}>
                      Nenhum registro encontrado hoje.
                    </TableCell>
                  </TableRow>
                )}
                {todayLogs.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className={styles.taskCell}>
                        <span className={styles.taskName}>
                          {entry.task?.title || 'Tarefa não especificada'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={styles.textRight}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={styles.actionBtn}
                      >
                        <Pencil className={styles.iconXs} />
                      </Button>
                    </TableCell>
                    <TableCell className={styles.tableHeadHidden}>
                      <Badge
                        variant="secondary"
                        className={styles.projectBadge}
                      >
                        {entry.task?.projectId?.split('-')[0].toUpperCase() ||
                          'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${styles.badgeNoBorder} ${natureColors[entry.nature] || styles.natureDefault}`}
                      >
                        {natureLabels[entry.nature] || entry.nature}
                      </Badge>
                    </TableCell>
                    <TableCell className={styles.dateCell}>
                      {entry.startTime} - {entry.endTime}
                    </TableCell>
                    <TableCell className={styles.hoursCell}>
                      {(entry.loggedMinutes / 60).toFixed(2)}h
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
