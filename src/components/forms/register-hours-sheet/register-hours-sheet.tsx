'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Check, ChevronsUpDown, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { createTimeLogSchema, type EnumTimeLogNature } from '@lib/shared';

// Importação dos hooks do backend
import {
  usePendingTime,
  useCreateTimeLog,
} from '../../../hooks/useTimeTracking';
import { useTasks } from '../../../hooks/useTasks';

import { Button } from '@/components/ui/button/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
import { Input } from '@/components/ui/input/input';
import { Textarea } from '@/components/ui/textarea/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover/popover';
import { Calendar } from '@/components/ui/calendar/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command/command';

import styles from './RegisterHoursSheet.module.css';

interface RegisterHoursSheetProps {
  trigger?: ReactNode;
  taskId?: string;
}

const natures: Record<EnumTimeLogNature, { label: string }> = {
  DEV: { label: 'Desenvolvimento' },
  MEETING: { label: 'Reunião' },
  TESTING: { label: 'Teste' },
  DOCUMENTATION: { label: 'Documentação' },
  CODE_REVIEW: { label: 'Code Review' },
  OTHER: { label: 'Outros' },
};

export function RegisterHoursSheet({
  trigger,
  taskId,
}: RegisterHoursSheetProps = {}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const activeTaskId = taskId || '';

  // Busca as tarefas do banco
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks(1, 100);

  // Formata as tarefas recebidas para o padrão do Combobox
  const tarefas =
    tasksData?.data?.map((task) => ({
      value: task.id,
      label: `${task.id.split('-')[0].toUpperCase()} - ${task.title}`,
    })) || [];

  // Instancia os hooks de mutação e busca de horas
  const { data: pendingData, isLoading: isLoadingPending } = usePendingTime(
    activeTaskId,
    open && !!activeTaskId,
  );
  const { mutateAsync: createLog } = useCreateTimeLog();

  type FormInput = z.infer<typeof createTimeLogSchema>;

  const form = useForm<FormInput>({
    resolver: zodResolver(createTimeLogSchema) as any,
    defaultValues: {
      taskId: activeTaskId,
      date: new Date(),
      startTime: '',
      endTime: '',
      nature: undefined as any,
      description: '',
    },
  });

  // Preenche o formulário automaticamente quando o modal abre e os dados pendentes chegam
  useEffect(() => {
    if (open) {
      if (pendingData && pendingData.firstStart) {
        form.reset({
          taskId: activeTaskId,
          date: new Date(pendingData.firstStart),
          startTime: format(new Date(pendingData.firstStart), 'HH:mm'),
          endTime: pendingData.lastEnd
            ? format(new Date(pendingData.lastEnd), 'HH:mm')
            : format(new Date(), 'HH:mm'),
          nature: undefined as any,
          description: '',
        });
      } else {
        form.reset({
          taskId: activeTaskId,
          date: new Date(),
          startTime: format(new Date(), 'HH:mm'),
          endTime: format(new Date(), 'HH:mm'),
          nature: undefined as any,
          description: '',
        });
      }
    }
  }, [open, pendingData, activeTaskId, form]);

  async function onSubmit(data: FormInput) {
    setIsLoading(true);

    try {
      const payload = {
        taskId: data.taskId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        nature: data.nature,
        description: data.description,
      };

      await createLog(payload);

      const tarefaLabel =
        tarefas.find((t) => t.value === data.taskId)?.label.split(' - ')[0] ||
        'Tarefa';

      toast.success('Horas registradas com sucesso!', {
        description: `${data.startTime} - ${data.endTime} em ${tarefaLabel}`,
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error('Erro ao registrar horas', {
        description: 'Verifique os dados e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Clock className={styles.iconLeft} />
            Registrar Horas
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className={styles.sheetContent}>
        <SheetHeader>
          <SheetTitle>Registrar Horas</SheetTitle>
          <SheetDescription>
            Consolide suas sessões ativas e descreva a atividade realizada.
          </SheetDescription>
        </SheetHeader>

        {isLoadingPending && (
          <div className={styles.alertPending}>Buscando tempo pendente...</div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            {taskId ? (
              <FormItem className={styles.flexCol}>
                <FormLabel>Tarefa Relacionada</FormLabel>
                <div className={styles.fixedTaskField}>
                  {tarefas.find((t) => t.value === taskId)?.label ||
                    'Tarefa selecionada'}
                </div>
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="taskId"
                render={({ field }) => (
                  <FormItem className={styles.flexCol}>
                    <FormLabel>Tarefa Relacionada</FormLabel>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={[
                              styles.comboboxTrigger,
                              !field.value && styles.textMuted,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {field.value
                              ? tarefas.find((t) => t.value === field.value)
                                  ?.label || 'Tarefa selecionada'
                              : 'Buscar tarefa...'}
                            <ChevronsUpDown className={styles.iconRight} />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className={styles.popoverContent}
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="Buscar tarefa..." />
                          <CommandList>
                            {isLoadingTasks ? (
                              <CommandEmpty>Carregando tarefas...</CommandEmpty>
                            ) : (
                              <CommandEmpty>
                                Nenhuma tarefa encontrada.
                              </CommandEmpty>
                            )}
                            <CommandGroup>
                              {tarefas.map((tarefa) => (
                                <CommandItem
                                  key={tarefa.value}
                                  value={tarefa.label}
                                  onSelect={() => {
                                    field.onChange(tarefa.value);
                                    setComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={[
                                      styles.iconLeft,
                                      field.value === tarefa.value
                                        ? styles.opacity100
                                        : styles.opacity0,
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                  />
                                  {tarefa.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className={styles.flexCol}>
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={[
                            styles.dateTrigger,
                            !field.value && styles.textMuted,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <CalendarIcon className={styles.iconLeft} />
                          {field.value ? (
                            format(field.value as Date, 'PPP', { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className={styles.calendarContent}
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={styles.grid2}>
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className={styles.inputField}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className={styles.inputField}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Natureza</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={styles.inputField}>
                        <SelectValue placeholder="Selecione a natureza" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(natures).map(([key, n]) => (
                        <SelectItem key={key} value={key}>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relato de Atividade</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que foi feito..."
                      className={styles.textarea}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className={styles.footer}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isLoadingPending}
                className={styles.submitButton}
              >
                {isLoading ? 'Salvando...' : 'Registrar Oficialmente'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
