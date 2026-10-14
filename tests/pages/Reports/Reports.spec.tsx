import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ReportsPage from '@/pages/reports/Reports';

const mockSave = vi.fn();
const mockAddImage = vi.fn();
const mockAddPage = vi.fn();

class MockJsPDF {
  addImage = mockAddImage;
  addPage = mockAddPage;
  save = mockSave;
}

vi.mock('jspdf', () => {
  return {
    jsPDF: MockJsPDF,
    default: MockJsPDF,
  };
});

vi.mock('html2canvas', () => {
  return {
    default: vi.fn().mockResolvedValue({
      toDataURL: () => 'data:image/png;base64,mock',
      width: 800,
      height: 1000,
    }),
  };
});

describe('Página de Relatórios (ReportsPage)', () => {
  it('deve renderizar o construtor de relatórios com os módulos principais', () => {
    render(
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Construtor de Relatórios/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Relatório Técnico de Adicionalidade e Balanço de Carbono/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Baixar PDF/i)).toBeInTheDocument();

    // O texto aparece tanto na lista quanto no preview
    const balancoElements = screen.getAllByText(/Balanço Anual de Carbono/i);
    expect(balancoElements.length).toBeGreaterThanOrEqual(1);
  });

  it('deve disparar a geração de PDF ao clicar no botão Baixar PDF', async () => {
    render(
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>,
    );

    const downloadButton = screen.getByRole('button', { name: /Baixar PDF/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        'Relatorio-Tecnico-Carbono-Sulflux.pdf',
      );
    });
  });
});
