import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ReportsPage from '@/pages/reports/Reports';

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
});
