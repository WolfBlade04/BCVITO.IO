// Service Worker para BCVito.io
const CACHE_NAME = 'bcvito-v1.0';
const urlsToCache = [
  '/BCVITO.IO/',
  '/BCVITO.IO/index.html',
  '/BCVITO.IO/favicon2.png',
  '/BCVITO.IO/logo-bcvito.png',
  'https://upload.wikimedia.org/wikipedia/commons/0/06/Flag_of_Venezuela.svg'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando cache viejo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - devolver respuesta del cache
        if (response) {
          return response;
        }
        
        // Clonar la petición
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verificar si la respuesta es válida
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        }).catch(() => {
          // Si falla la red y no está en cache, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/BCVITO.IO/index.html');
          }
        });
      })
  );
});