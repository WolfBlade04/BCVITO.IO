const CACHE_NAME = 'bcvito-cache-v3';
const urlsToCache = [
  '/BCVITO.IO/',
  '/BCVITO.IO/index.html',
  '/BCVITO.IO/favicon2.png',
  '/BCVITO.IO/logo-bcvito.png',
  'https://upload.wikimedia.org/wikipedia/commons/0/06/Flag_of_Venezuela.svg',
  'https://fonts.googleapis.com/css2?family=Arial&display=swap'
];

// Instalar Service Worker y cachear recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar solicitudes y servir desde cache si está disponible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - devolver respuesta desde cache
        if (response) {
          return response;
        }
        
        // Clonar la solicitud
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verificar si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          // Abrir cache y almacenar la respuesta
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        }).catch(() => {
          // Si no hay conexión y no está en cache, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/BCVITO.IO/');
          }
        });
      })
  );
});

// Activar nuevo Service Worker y eliminar caches antiguos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});