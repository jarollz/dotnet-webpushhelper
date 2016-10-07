using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using WebTester.Models;
using static Jrz.WebPushHelper;

namespace WebTester.Controllers {
    public class HomeController : Controller {
        [HttpGet]
        public ActionResult Index() {
            var allEndpoints = PushSubscriptions.Select(p => p.endpoint).ToList();
            var mdl = new TestPushRequest();
            mdl.Endpoints = new Dictionary<string, bool>();
            foreach (var ep in allEndpoints) {
                mdl.Endpoints.Add(ep, false);
            }
            mdl.PushResults = new Dictionary<string, string>();

            return View(mdl);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Index(TestPushRequest mdl) {
            var allEndpoints = PushSubscriptions.Select(p => p.endpoint).ToList();
            var sentEndpoints = mdl.Endpoints;
            var pushResults = new Dictionary<string, string>();

            if (ModelState.IsValid) {
                var checkedEndpoints = sentEndpoints.Where(ce => ce.Value).ToList();
                if (checkedEndpoints.Count == 0) {
                    ModelState.AddModelError("", "Please check at least one endpoint to receive the push notification.");
                } else {
                    foreach (var ce in checkedEndpoints) {
                        var subscription = PushSubscriptions.Where(ps => ps.endpoint == ce.Key).FirstOrDefault();
                        if (subscription == null) {
                            ModelState.AddModelError("Endpoints", "Invalid endpoint detected (" + ce.Key + ")");
                            pushResults.Add(ce.Key, "Invalid endpoint");
                        } else {
                            // the real magic here...
                            var result = SendNotification(Encoding.UTF8.GetBytes(mdl.PayloadJson), subscription);
                            if (result) {
                                pushResults.Add(ce.Key, "Success");
                            } else {
                                pushResults.Add(ce.Key, "Failure");
                            }
                        }
                    }
                }
            }

            mdl.Endpoints = new Dictionary<string, bool>();
            foreach (var ep in allEndpoints) {
                mdl.Endpoints.Add(ep, (
                    sentEndpoints != null && sentEndpoints.ContainsKey(ep) ? sentEndpoints[ep] : false
                    ));
            }

            return View(mdl);
        }

        private LinkedList<JsonSubscription> PushSubscriptions {
            get {
                if (HttpContext.Application["TEST_PUSH_REGISTRATIONS"] == null || !(HttpContext.Application["TEST_PUSH_REGISTRATIONS"] is LinkedList<JsonSubscription>)) {
                    HttpContext.Application["TEST_PUSH_REGISTRATIONS"] = new LinkedList<JsonSubscription>();
                }
                return HttpContext.Application["TEST_PUSH_REGISTRATIONS"] as LinkedList<JsonSubscription>;
            }
        }
    }
}