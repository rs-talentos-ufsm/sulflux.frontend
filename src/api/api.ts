import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 5001}/api`,
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

    // Verifica se é erro 401 e se a rota não é a própria rota de refresh (evita loop)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/refresh'
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
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
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
