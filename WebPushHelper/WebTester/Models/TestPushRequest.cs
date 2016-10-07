using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebTester.Models {
    public class TestPushRequest {

        [Required]
        [Display(Name = "Payload JSON")]
        public string PayloadJson { get; set; }

        [Required]
        [Display(Name = "Last 10 registered subscription endpoints")]
        public IDictionary<string, bool> Endpoints { get; set; }

        public IDictionary<string,string> PushResults { get; set; }
    }
}