using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using static Jrz.WebPushHelper;

namespace WebTester.Controllers {
    [RoutePrefix("api/PushNotification")]
    public class PushNotificationController : ApiController {
        [HttpPost]
        [Route("Register")]
        public object Register(dynamic subscription) {
            dynamic existing = PushSubscriptions.Where(p => (string)p.endpoint == (string)subscription.endpoint).FirstOrDefault();
            if (existing == null) {
                if (PushSubscriptions.Count > 10) {
                    PushSubscriptions.RemoveFirst();
                }
                PushSubscriptions.AddLast(new JsonSubscription() {
                    endpoint = subscription.endpoint.ToString(),
                    keys = new Dictionary<string, string>() {
                        { "p256dh", subscription.keys.p256dh.ToString() },
                        { "auth", subscription.keys.auth.ToString() }
                    }
                });
                return new { Success = true, Message = "Registered", Registered = subscription };
            } else {
                return new { Success = true, Message = "Already Registered", Registered = subscription };
            }
        }

        private LinkedList<JsonSubscription> PushSubscriptions {
            get {
                if (HttpContext.Current.Application["TEST_PUSH_REGISTRATIONS"] == null || !(HttpContext.Current.Application["TEST_PUSH_REGISTRATIONS"] is LinkedList<JsonSubscription>)) {
                    HttpContext.Current.Application["TEST_PUSH_REGISTRATIONS"] = new LinkedList<JsonSubscription>();
                }
                return HttpContext.Current.Application["TEST_PUSH_REGISTRATIONS"] as LinkedList<JsonSubscription>;
            }
        }
    }
}
