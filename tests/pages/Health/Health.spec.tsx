import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import Health from '@/pages/health/Health';

// 1. Usamos vi.hoisted() para garantir que a instância seja criada ANTES do vi.mock rodar
const mockAxiosInstance = vi.hoisted(() => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
});

// 2. Agora o vi.mock consegue acessar a variável tranquilamente
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('Página de Health', () => {
  it('deve renderizar o componente de Health e resolver a chamada da API', async () => {
    // 3. A configuração continua idêntica
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: { message: 'Service is healthy' },
    });

    render(
      <MemoryRouter>
        <Health />
      </MemoryRouter>,
    );

    const titulo = screen.getByText(/Frontend - Hello, World/i);
    expect(titulo).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Service is healthy/i)).toBeInTheDocument();
    });
  });
});
