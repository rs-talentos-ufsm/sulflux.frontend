import axios from 'axios';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    if (
      envUrl &&
      !envUrl.includes('localhost') &&
      !envUrl.includes('127.0.0.1')
    ) {
      return envUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    }
    return 'https://api-sulflux.dorneles.dev';
  }
  return (
    envUrl || `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 5001}`
  )
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');
};

export const normalizedApiUrl = getApiUrl();
export const DORNELES_LOGIN_URL = `${normalizedApiUrl}/api/auth/dorneles/login`;

const api = axios.create({
  baseURL: normalizedApiUrl,
  withCredentials: true,
});

// Variáveis de controle para a fila de requisições
let isRefreshing = false;
// A tipagem da fila foi simplificada, pois não precisamos mais passar o token
let failedQueue: Array<{
  resolve: () => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(); // Apenas avisa que a requisição pode continuar
    }
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR: Captura o 401 e tenta renovar
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Rotas de autenticação que NUNCA devem disparar renovação automática (refresh token)
    const isAuthBypassUrl =
      typeof originalRequest.url === 'string' &&
      (originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/register') ||
        originalRequest.url.includes('/auth/logout') ||
        originalRequest.url.includes('/auth/refresh') ||
        originalRequest.url.includes('/auth/dorneles/callback') ||
        originalRequest.url.includes('/callback'));

    // Verifica se é erro 401, se não é uma rota de autenticação e se não foi retentada
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthBypassUrl
    ) {
      if (isRefreshing) {
        // Coloca na fila se já estiver renovando
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // O navegador já anexou o novo cookie automaticamente, só refazer a chamada
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenta renovar o token. O navegador envia o Refresh Token (Cookie) automaticamente.
        await axios.post(
          `${normalizedApiUrl}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // Se a chamada acima deu 204 Sucesso, o back-end já injetou o novo accessToken no Cookie.
        // Só precisamos liberar a fila e refazer a requisição original.
        processQueue(null);

        return api(originalRequest);
      } catch (err) {
        // Falhou na renovação (Refresh Token expirou de verdade)
        processQueue(err);

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
