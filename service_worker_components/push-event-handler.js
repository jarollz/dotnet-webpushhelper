//
// Setup service worker to handle push event
//

self.BASE_URL = "http://localhost:36614/";

self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
    console.info("Push notification received:", event);

    var data = {
        title: "Web Push Helper",
        body: "----"
    };

    if (event.data) {
        var payload = event.data.json();
        data.body = JSON.stringify(payload);
    }

    event.waitUntil(
        Promise.all([
            self.registration.showNotification(data.title, data)
        ])
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click: tag', event.notification.tag);
    // Android doesn't close the notification when you click it
    // See http://crbug.com/463146
    event.notification.close();
    var url = self.BASE_URL;
    // Check if there's already a tab open with this URL.
    // If yes: focus on the tab.
    // If no: open a tab with the URL.
    event.waitUntil(
      clients.matchAll({
          type: 'window'
      })
      .then(function (windowClients) {
          console.log('WindowClients', windowClients);
          for (var i = 0; i < windowClients.length; i++) {
              var client = windowClients[i];
              console.log('WindowClient', client);
              if (client.url === url && 'focus' in client) {
                  return client.focus();
              }
          }
          if (clients.openWindow) {
              return clients.openWindow(url);
          }
      })
    );
});