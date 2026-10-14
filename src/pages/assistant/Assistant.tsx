import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, Layers, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import {
  useAssistantContext,
  useAssistantMessages,
  useSendAssistantMessage,
  useClearAssistantMessages,
} from '@/hooks/useAssistant';

import styles from './Assistant.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: Array<{ label: string; category: string }>;
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  text: 'Olá! Sou o Assistente Sulflux. Conheço os fluxos de carbono medidos por Eddy Covariance, a umidade do solo e os laudos de satélite das suas fazendas. Como posso ajudar você hoje?',
  citations: [
    { label: 'Eddy Covariance Ativo', category: 'carbono' },
    { label: 'Sentinel-2A 10m', category: 'satelite' },
  ],
};

export default function AssistantPage() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    DEFAULT_WELCOME_MESSAGE,
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: context } = useAssistantContext();
  const { data: historyMessages, isLoading: isLoadingHistory } =
    useAssistantMessages();
  const sendMessageMutation = useSendAssistantMessage();
  const clearMessagesMutation = useClearAssistantMessages();

  // Sincroniza histórico inicial quando os dados da API chegarem
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      setMessages(
        historyMessages.map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          citations: m.citations,
        })),
      );
    } else if (historyMessages && historyMessages.length === 0) {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  }, [historyMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMessageMutation.isPending]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || sendMessageMutation.isPending) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    try {
      const response = await sendMessageMutation.mutateAsync(text.trim());
      setMessages((prev) => [
        ...prev,
        {
          id: response.id,
          role: 'assistant',
          text: response.text,
          citations: response.citations,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'Desculpe, ocorreu uma instabilidade ao processar os dados das suas fazendas. Por favor, tente novamente.',
        },
      ]);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearMessagesMutation.mutateAsync();
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    } catch {
      // Caso ocorra erro ao limpar no backend, reseta localmente
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>
            <Bot size={28} style={{ color: 'var(--primary)' }} />
            Assistente Sulflux
          </h1>
          <p className={styles.subtitle}>
            Seu copiloto agrícola inteligente. Faça perguntas sobre balanço de
            carbono, estresse hídrico, histórico de safras e recomendações de
            manejo com inteligência artificial.
          </p>
        </div>

        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClearHistory}
          disabled={clearMessagesMutation.isPending}
          title="Reiniciar conversa e limpar histórico"
        >
          {clearMessagesMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RotateCcw size={14} />
          )}
          <span>Reiniciar chat</span>
        </button>
      </div>

      <div className={styles.assistantLayout}>
        {/* Painel de Chat */}
        <div className={styles.chatCard}>
          <div className={styles.chatMessages}>
            {isLoadingHistory && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '2rem',
                  color: 'var(--muted-foreground)',
                  fontSize: '0.875rem',
                }}
              >
                <Loader2 size={16} className="animate-spin" />
                <span>Carregando histórico do assistente...</span>
              </div>
            )}

            {!isLoadingHistory &&
              messages.map((msg) =>
                msg.role === 'user' ? (
                  <div key={msg.id} className={styles.messageRowUser}>
                    <div className={styles.bubbleUser}>{msg.text}</div>
                  </div>
                ) : (
                  <div key={msg.id} className={styles.messageRowAssistant}>
                    <div className={styles.assistantAvatar}>
                      <Bot size={16} />
                    </div>
                    <div className={styles.bubbleAssistant}>
                      <div>{msg.text}</div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className={styles.citationsList}>
                          {msg.citations.map((c, idx) => (
                            <span key={idx} className={styles.citationTag}>
                              {c.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}

            {sendMessageMutation.isPending && (
              <div className={styles.messageRowAssistant}>
                <div className={styles.assistantAvatar}>
                  <Bot size={16} />
                </div>
                <div className={styles.bubbleAssistant}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    <Loader2 className="animate-spin" size={16} />
                    <span>Consultando inteligência ambiental Sulflux...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões de Perguntas Rápidas */}
          {context?.suggestedPrompts && (
            <div className={styles.suggestedPromptsBar}>
              {context.suggestedPrompts.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleSend(p.query)}
                >
                  <Sparkles
                    size={12}
                    style={{
                      display: 'inline',
                      marginRight: '4px',
                      color: 'var(--primary)',
                    }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Campo de Entrada */}
          <div className={styles.chatInputArea}>
            <Input
              placeholder="Pergunte sobre carbono, água, talhões ou manejo..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMessageMutation.isPending}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || sendMessageMutation.isPending}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>

        {/* Contexto Operacional da Fazenda */}
        <div className={styles.contextCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
            <h3 className={styles.contextTitle}>Contexto do Produtor</h3>
          </div>

          <div className={styles.contextSummaryList}>
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Produtor</span>
              <span className={styles.contextValue}>
                {context?.producerName || 'Produtor'}
              </span>
            </div>

            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Organização</span>
              <span className={styles.contextValue}>
                {context?.organization || 'Agropecuária Sul'}
              </span>
            </div>

            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Propriedades</span>
              <span className={styles.contextValue}>
                {context?.totalProperties ?? 0} cadastradas
              </span>
            </div>

            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Talhões Prontos</span>
              <span className={styles.contextValue}>
                {context?.readyFieldsCount ?? 0} analisados
              </span>
            </div>

            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Safra Ativa</span>
              <span className={styles.contextValue}>
                {context?.activeSeason || 'Safra 23/24'}
              </span>
            </div>

            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Balanço de C Total</span>
              <span
                className={styles.contextValue}
                style={{ color: 'var(--primary)' }}
              >
                {context?.totalCarbonBalance || '+40 t CO2e'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
