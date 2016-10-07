# Web Push Helper for Firebase Cloud Messaging #

This is the .NET library to send push notification using Firebase Cloud Messaging.
The purpose of this being built is to ease sending push notification to a web app
with payload data which to be successful would require encryption technique that's
not easy for the faint of heart.

Inspired by [this StackOverflow answer](http://stackoverflow.com/a/39839330/426000).

## Usage in ASP .NET app ##

1.  Include the `WebPushHelper` lib, get it from the folder `dist`
2.  In `Global.asax.cs` right in `Application_Start` method, add the statement:
    
    ```
    Jrz.WebPushHelper.FirebaseServerKey = "... your FCM server key ..."
    ```

3.  To send push notification, you can do it like:
    -   Let's say that you've registered a Chrome push notification subscription to your server, and the 
        subscription JSON looks like:

        ```
        {
            endpoint: "https://android.googleapis.com/gcm/send/[registrationId]"
            keys: {
                p256dh: "[userKey]",
                auth: "[userSecret]"
            }
        }
        ```

    -   Create a `Jrz.JsonSubscription` instance using the above subscription JSON:

        ```
        var sub = new Jrz.JsonSubscription() {
            endpoint = subJson.endpoint.ToString(),
            keys = new Dictionary<string,string>() {
                { "p256dh", subJson.keys.p256dh.ToString() },
                { "auth", subJson.keys.auth.ToString() }
            }
        }
        ```

    -   Convert the data you wan't to send to a byte array. The best way I think, is to convert your data to a
        JSON string and then to a byte array. So, using the popular `Newtonsoft.Json` library, you can do:
        
        ```
        var payload = System.Text.Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(yourData));
        ```

    -   Now, to send push notification with payload:
        
        ```
        bool isSendPushSuccess = Jrz.WebPushHelper.SendNotification(payload, sub);
        ```

4.  Peruse `Jrz.WebPushHelper` and `Jrz.JsonSubscription` class in Visual Studio object browser to know
    more, especially other overloads of the `SendNotification` method.
5.  You can also open `WebPushHelper/WebPushHelper.sln` in Visual Studio 2015 and run the `WebTester` project
    to see push notification in action. However make sure to use your own FCM server key and sender id, please :D.
    *  Set your FCM server key in `Web.config` right at `appSettings["FirebaseServerKey"]`
    *  Set your sender id in `manifest.json` right at `gcm_sender_id`

## Dev Env & Libs ##

-  Visual Studio 2015
-  .NET Framework 4.5.2
-  ASP .NET MVC 5
-  nodeJS v6.5.0 (npm v3.10.3)
-  Nuget package BouncyCastle
-  Nuget package Microsoft.AspNetCore.WebUtilities