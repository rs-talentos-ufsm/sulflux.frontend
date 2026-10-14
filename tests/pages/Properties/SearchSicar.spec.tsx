import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import SearchSicarPage from '@/pages/properties/search-sicar/SearchSicar';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('SearchSicarPage', () => {
  it('deve renderizar o campo de busca de CAR oficial e botão de inserção manual', () => {
    render(
      <MemoryRouter>
        <SearchSicarPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Cadastrar Nova Propriedade')).toBeInTheDocument();
    expect(screen.getByText('Número do CAR')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('RS-4305108-A1F3B2C4D5E6...'),
    ).toBeInTheDocument();
    expect(screen.getByText('Buscar CAR')).toBeInTheDocument();
    expect(screen.getByText('Inserir dados manualmente')).toBeInTheDocument();
  });

  it('deve manter o botão Buscar CAR desabilitado quando o campo estiver vazio', async () => {
    render(
      <MemoryRouter>
        <SearchSicarPage />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('RS-4305108-A1F3B2C4D5E6...');
    const searchButton = screen.getByRole('button', { name: /Buscar CAR/i });

    fireEvent.change(input, { target: { value: '' } });
    expect(searchButton).toBeDisabled();
  });

  it('deve rejeitar busca de CAR fora do formato oficial do SICAR (43 caracteres)', async () => {
    render(
      <MemoryRouter>
        <SearchSicarPage />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('RS-4305108-A1F3B2C4D5E6...');
    const searchButton = screen.getByRole('button', { name: /Buscar CAR/i });

    // CAR inválido (formato simplificado/curto)
    fireEvent.change(input, { target: { value: 'RS-4305108-INVALID' } });
    fireEvent.click(searchButton);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Formato do CAR inválido'),
    );
  });
});
