import type { UserResponseDTO } from '@lib/shared';

export interface UserAvatarInfo {
  avatarUrl: string | null;
  userNamePreview: string;
  userInitials: string;
}

/**
 * Sintetiza e padroniza as informações de avatar, nome resumido e iniciais do usuário.
 * Utiliza o DTO tipado UserResponseDTO sem recorrer a type assertions inseguras (any).
 *
 * @param user Objeto de usuário ou dados parciais compatíveis com UserResponseDTO
 * @returns Objeto contendo avatarUrl, userNamePreview e userInitials
 */
export function getUserAvatarInfo(
  user?: Partial<UserResponseDTO> | null,
): UserAvatarInfo {
  const avatarUrl = null;

  const trimmedName = user?.name?.trim();
  const nameParts = trimmedName ? trimmedName.split(/\s+/) : [];

  const userNamePreview =
    nameParts.length > 0 ? nameParts.slice(0, 2).join(' ') : 'Usuário';

  const userInitials =
    nameParts.length > 0
      ? nameParts
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'US';

  return {
    avatarUrl,
    userNamePreview,
    userInitials,
  };
}
