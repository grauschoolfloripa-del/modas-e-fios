/**
 * Service worker do Modas e Fios.
 *
 * O que fica offline: o "casco" do site (páginas visitadas, ícones,
 * estilos) e materiais/PDFs de apoio. O que NUNCA fica em cache:
 * qualquer coisa de /api/, /admin, /conta, /cursos e /login — são
 * rotas autenticadas ou sensíveis, e os vídeos de aula (protegidos por
 * matrícula) não são baixados para uso offline — ver decisão na Fase 4
 * do plano: download de vídeo protegido não é viável em PWA.
 */
const CACHE_NAME = "modas-e-fios-v1";
const PRECACHE_URLS = ["/", "/loja", "/manifest.json"];

const NEVER_CACHE = [/^\/api\//, /^\/admin/, /^\/conta/, /^\/cursos/, /^\/login/, /^\/cadastro/, /^\/logout/];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER_CACHE.some((re) => re.test(url.pathname))) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
  );
});
