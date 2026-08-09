import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from '@lib/shared';
// import { format } from "date-fns"
// import { ptBR } from "date-fns/locale"
import { FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select/select"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover/popover"
// import { Calendar } from "@/components/ui/calendar/calendar"

import styles from './NewProjectSheet.module.css';
import { createProjectSchema } from '@lib/shared';

// Importação dos hooks do backend
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
// TODO: Importe o seu hook de autenticação para pegar o ID do usuário logado
// import { useAuth } from '@/hooks/useAuth';

// import { ProjectPriority } from "@lib/shared"

// const arquiteturas = [
//   { value: "monolito", label: "Monolito" },
//   { value: "microservicos", label: "Microservicos" },
//   { value: "monorepo", label: "Monorepo" },
//   { value: "serverless", label: "Serverless" },
// ]

interface NewProjectSheetProps {
  mode?: 'create' | 'edit';
  trigger?: ReactNode;
  projectId?: string; // Adicionado para sabermos qual projeto atualizar no modo edit
}

export function NewProjectSheet({
  mode = 'create',
  trigger,
  projectId,
}: NewProjectSheetProps = {}) {
  const isEdit = mode === 'edit';
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Instancia os hooks de mutação
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: updateProject } = useUpdateProject();

  type FormInput = z.input<typeof createProjectSchema>;

  const form = useForm<FormInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      // description: "",
      // priority: ProjectPriority.Low,
    },
  });

  async function onSubmit(data: FormInput) {
    setIsLoading(true);

    try {
      // Garantimos os dados no formato exato que o backend/DTO espera
      const payload = {
        name: data.name,
        // memberIds: []
        // description: data.description,
        // status: data.status ?? "active",
        // priority: data.priority ?? "low",
        // startDate: data.startDate ? new Date(data.startDate as string | number | Date) : undefined,
      } as const;

      if (isEdit && projectId) {
        // você configurou a atualização da posse do projeto
        await updateProject({ id: projectId, data: payload });
        toast.success('Projeto atualizado com sucesso!', {
          description: `"${payload.name}" foi atualizado.`,
        });
      } else {
        await createProject(payload);
        toast.success('Projeto criado com sucesso!', {
          description: `"${payload.name}" foi criado.`,
        });
      }

      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        isEdit ? 'Erro ao atualizar projeto' : 'Erro ao criar projeto',
        {
          description: 'Verifique os dados e tente novamente.',
        },
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button>
            <FolderPlus className={styles.icon} />
            Novo Projeto
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className={styles.sheetContent}>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Atualize os dados do projeto.'
              : 'Configure os dados iniciais do novo projeto.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Sistema de Gestão Comercial"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <div className={styles.gridRow}>
              <FormField
                control={form.control}
                name="arquitetura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Arquitetura</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {arquiteturas.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
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
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente Associado</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do cliente"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className={styles.gridRow}>
              <FormField
                control={form.control}
                name="kickoff"
                render={({ field }) => (
                  <FormItem className={styles.formItemCol}>
                    <FormLabel>Data de Kickoff</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={[
                              styles.calendarBtn,
                              !field.value && styles.calendarPlaceholder
                            ].filter(Boolean).join(' ')}
                          >
                            <CalendarIcon className={styles.icon} />
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className={styles.popoverContent} align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orcamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orçamento Inicial</FormLabel>
                    <FormControl>
                      <div className={styles.inputWrapper}>
                        <span className={styles.currencySymbol}>R$</span>
                        <Input
                          type="text"
                          placeholder="0,00"
                          className={styles.moneyInput}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div> */}

            <SheetFooter className={styles.footer}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEdit
                    ? 'Salvando...'
                    : 'Criando...'
                  : isEdit
                    ? 'Salvar Alterações'
                    : 'Criar Projeto'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
