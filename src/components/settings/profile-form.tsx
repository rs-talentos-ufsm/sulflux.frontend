import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar/avatar';
import { Button } from '../ui/button/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card/card';
import { Input } from '../ui/input/input';
import { Label } from '../ui/label/label';
// import { Textarea } from "../../ui/textarea/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../ui/select/select"

import styles from './ProfileForm.module.css';
import { useUpdateUser } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/authStore';

export function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const { mutate: updateUser, isPending } = useUpdateUser();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    // telefone: "",
    // cargo: "",
    // departamento: "",
    // bio: "",
    // localizacao: "",
    // linkedin: "",
    // github: "",
  });

  // Sincroniza os dados do banco (Zustand) com o form assim que o usuário carregar
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nome: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Mapeia o formData para o padrão que o UpdateUserDTO espera
    updateUser({
      id: user.id,
      data: {
        name: formData.nome,
        email: formData.email,
      },
    });
  };

  // Se o usuário ainda não carregou do store, não renderiza o formulário quebrado
  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informacoes Pessoais</CardTitle>
        <CardDescription>
          Atualize suas informacoes pessoais e de contato.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className={styles.cardContent}>
          <div className={styles.avatarSection}>
            <div className={styles.relativeWrapper}>
              <Avatar className={styles.avatarLarge}>
                {/* Quando houver URL de avatar no BD: src={user.avatarUrl} */}
                <AvatarImage src="/placeholder.svg" alt={user.name} />
                <AvatarFallback className={styles.avatarFallbackLarge}>
                  {user.name
                    ?.split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'US'}
                </AvatarFallback>
              </Avatar>
              {/* <button
                type="button"
                className={styles.cameraButton}
                aria-label="Alterar foto de perfil"
              >
                <Camera className={styles.cameraIcon} />
              </button> */}
            </div>
            <div className={styles.avatarTextSection}>
              <p className={styles.nameText}>{user.name}</p>
              {/* <p className={styles.mutedText}>{formData.cargo}</p> */}
              {/* <p className={styles.xsMutedText}>
                Formatos aceitos: JPG, PNG. Tamanho maximo: 2MB.
              </p> */}
            </div>
          </div>

          <div className={styles.gridContainer}>
            <div className={styles.inputGroup}>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            {/* <div className={styles.inputGroup}>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) =>
                  setFormData({ ...formData, cargo: e.target.value })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <Label htmlFor="departamento">Departamento</Label>
              <Select
                value={formData.departamento}
                onValueChange={(value) =>
                  setFormData({ ...formData, departamento: value })
                }
              >
                <SelectTrigger id="departamento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engenharia</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="operations">Operacoes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={styles.inputGroup}>
              <Label htmlFor="localizacao">Localizacao</Label>
              <Input
                id="localizacao"
                value={formData.localizacao}
                onChange={(e) =>
                  setFormData({ ...formData, localizacao: e.target.value })
                }
              />
            </div> */}
          </div>

          {/* <div className={styles.inputGroup}>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className={styles.textareaNoResize}
            />
            <p className={styles.xsMutedText}>
              Breve descricao visivel para membros do time.
            </p>
          </div> */}

          {/* <div className={styles.gridContainer}>
            <div className={styles.inputGroup}>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
              />
            </div>
          </div> */}

          <div className={styles.footerAction}>
            {/* O button agora tem type="submit" e desabilita durante o load */}
            <Button type="submit" disabled={isPending}>
              <Save className={styles.saveIcon} />
              {isPending ? 'Salvando...' : 'Salvar alteracoes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
