var __deviceIsRegisteringForTestPush = false;
function __testRegisterDeviceForPush(subscription) {
    if (!__deviceIsRegisteringForTestPush) {
        __deviceIsRegisteringForTestPush = true;
        console.log("Registering to test push system...");
        var headers = new Headers();
        headers.append('Content-Type', 'application/json'),
        fetch('api/PushNotification/Register', {
            method: 'post',
            headers: headers,
            body: JSON.stringify(subscription)
        })
        .then(function (resp) { return resp.json() })
        .then(function (regjs) {
            __deviceIsRegisteringForTestPush = false;
            console.log("Browser registered to test push system.", regjs);
        });
    }
}

//To subscribe `push notification`
function __subscribePush() {
    return navigator.serviceWorker.getRegistration()
      .then(function (registration) {
          if (!registration.pushManager) {
              //console.error('Your browser doesn\'t support push notification.');
              return "unsupported";
          }

          //To subscribe `push notification` from push manager
          return registration.pushManager.subscribe({
              userVisibleOnly: true //Always show notification when received
          });
      }).then(function (subscription) {
          if (subscription === "unsupported") {
              return subscription;
          }
          //console.info('Push notification subscribed.');
          __testRegisterDeviceForPush(subscription);
          // TODO should register to SAM server too
          return "subscribed";
      }).catch(function (error) {
          //console.warn('Push notification subscription error: ', error);
          return "error";
      });
}

//To unsubscribe `push notification`
function __unsubscribePush() {
    return navigator.serviceWorker.getRegistration()
      .then(function (registration) {
          //Get `push subscription`
          return registration.pushManager.getSubscription();
      }).then(function (subscription) {
          //If no `push subscription`, then return
          if (!subscription) {
              //console.error('Unable to unregister push notification.');
              return "no-subscription";
          }

          //Unsubscribe `push notification`
          return subscription.unsubscribe();
      }).then(function (prom) {
          if (prop === "no-subscription") {
              return prop;
          }
          //console.info('Push notification unsubscribed.');
          return "unsubscribed";
      }).catch(function (error) {
          //console.error('Failed to unsubscribe push notification.');
          return "error";
      });
}

function __isPushSupported() {

    //Check `push notification` is supported or not
    if (!('PushManager' in window)) {
        //console.error('Push notification isn\'t supported in your browser.');
        return new Promise(function (resolve) { resolve("unsupported"); });
    }

    //To check `push notification` permission is denied by user
    if (Notification.permission === 'denied') {
        //console.warn('User has blocked push notification.');
        return new Promise(function (resolve) { resolve("denied"); });
    }

    //Get `push notification` subscription
    //If `serviceWorker` is registered and ready
    return navigator.serviceWorker.getRegistration()
      .then(function (registration) {
          return registration.pushManager.getSubscription()
      }).then(function (subscription) {
          //If already access granted, enable push button status
          if (subscription) {
              //console.info("Push notification GRANTED");
              return "subscribed";
          }
          else {
              //console.info("Push notification NOT GRANTED");
              return "unsubscribed";
          }
      }).catch(function (error) {
          //console.error('Error occurred while enabling push ', error);
          return "error";
      });
}

function __getPushNotificationSubscriptionObject() {
    return navigator.serviceWorker.getRegistration()
      .then(function (registration) {
          return registration.pushManager.getSubscription()
      }).then(function (subscription) {
          return subscription;
      });
}

function __curlCommandForPushNotification() {
    return navigator.serviceWorker.getRegistration()
      .then(function (registration) {
          return registration.pushManager.getSubscription()
      }).then(function (subscription) {
          var temp = subscription.endpoint.split('/');
          var fcmURL = "https://fcm.googleapis.com/fcm/send";
          var registrationId = temp[temp.length - 1];
          var curlCommand = 'curl --header "Authorization: key=<SERVER_KEY>" --header Content-Type:"application/json" ' + fcmURL + ' -d "{\\"registration_ids\\":[\\"' + registrationId + '\\"]}"';
          console.log("%c curl command to send push notification ", "background: #000; color: #fff; font-size: 13px;");
          console.log(curlCommand);
      });
}

// Attempt to ask for permission if we're not granted permission, just in case the user at any moment
// change his/her mind
__pushSubscribePersistentAttempt = null;

function __checkForPushSubscription() {
    clearInterval(__pushSubscribePersistentAttempt);
    __isPushSupported().then(function (status) {
        if (status != "error" && status != "unsupported") {
            __subscribePush().then(function (subStatus) {
                if (subStatus != "subscribed") {
                    __pushSubscribePersistentAttempt = setInterval(__checkForPushSubscription, 1000);
                } else {
                    console.info("Push notification subscribed.");
                }
            });
        }
    });
}

__pushSubscribePersistentAttempt = setInterval(__checkForPushSubscription, 1000);