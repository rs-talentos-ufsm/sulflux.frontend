import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  type CreateTaskDTO,
  TaskPriority,
  createTaskSchema,
} from '@lib/shared';
import { useCreateTask } from '@/hooks/useTasks';

import { Button } from '../../ui/button/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form/form';
import { Input } from '../../ui/input/input';
import { Textarea } from '../../ui/textarea/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover/popover';
import { Calendar } from '../../ui/calendar/calendar';
import styles from './NewTaskDialog.module.css';
import { useProjects } from '@/hooks/useProjects';

export function NewTaskDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createTask, isPending, error, isError } = useCreateTask();

  const { data: paginatedProjects, isLoading: isLoadingProjects } = useProjects(
    1,
    100,
  );
  const projects = paginatedProjects?.data || [];

  type FormInput = z.input<typeof createTaskSchema>;

  const form = useForm<FormInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      priority: TaskPriority.Low,
      dueDate: undefined,
    },
  });

  const onSubmit = (data: FormInput) => {
    const taskData = data as CreateTaskDTO;

    createTask(taskData, {
      onSuccess: () => {
        toast.success('Tarefa criada com sucesso!');
        form.reset();
        setOpen(false);
      },
    });
  };

  const getErrorMessage = () => {
    if (!error) return null;
    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      'Erro ao criar tarefa.'
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={styles.primaryButton}>
          <Plus className={styles.iconLeft} />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar uma nova tarefa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <FormField
              control={form.control}
              name="title" // Corrigido de "titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o título da tarefa"
                      className={styles.input}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={styles.grid2}>
              <FormField
                control={form.control}
                name="projectId" // Corrigido de "produtoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    {/* Desabilita o select enquanto carrega ou salva */}
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending || isLoadingProjects}
                    >
                      <FormControl>
                        <SelectTrigger className={styles.input}>
                          <SelectValue
                            placeholder={
                              isLoadingProjects ? 'Carregando...' : 'Selecione'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Renderiza os projetos */}
                        {projects.length === 0 && !isLoadingProjects ? (
                          <SelectItem value="empty" disabled>
                            Nenhum projeto encontrado
                          </SelectItem>
                        ) : (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority" // Corrigido de "prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className={styles.input}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaskPriority.Low}>Baixa</SelectItem>
                        <SelectItem value={TaskPriority.Medium}>
                          Média
                        </SelectItem>
                        <SelectItem value={TaskPriority.High}>Alta</SelectItem>
                        <SelectItem value={TaskPriority.Urgent}>
                          Urgente
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate" // Corrigido de "prazo"
              render={({ field }) => (
                <FormItem className={styles.formItemCol}>
                  <FormLabel>Prazo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          disabled={isPending}
                          className={[
                            styles.dateButton,
                            !field.value ? styles.mutedText : '',
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
                      className={styles.popoverContent}
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value as Date | undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description" // Corrigido de "descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes da tarefa..."
                      className={styles.textarea}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isError && (
              <p style={{ color: 'red', fontSize: '0.875rem' }}>
                {getErrorMessage()}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} variant={'default'}>
                {isPending ? 'Salvando...' : 'Criar Tarefa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
