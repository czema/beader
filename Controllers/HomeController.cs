using Microsoft.AspNetCore.Mvc;

using Beader.Models;

namespace Beader.Controllers;
public class HomeController : Controller {

   [HttpGet("/")]
   public IActionResult Index() {

      var model = new IndexModel(HttpContext.User);

      return View(model);
   }

   [HttpGet("/Draw")]
   public IActionResult Draw() {

      var model = new IndexModel(HttpContext.User);

      return View(model);
   }

   [HttpGet("/Subscribe")]
   public IActionResult Subscribe() {

      var model = new IndexModel(HttpContext.User);

      return View(model);
   }

   [HttpGet("/Privacy")]
   public IActionResult Privacy() {

      var model = new LayoutModel(HttpContext.User);

      return View(model);
   }

   [HttpGet("/UserAgreement")]
   public IActionResult UserAgreement() {

      var model = new LayoutModel(HttpContext.User);

      return View(model);
   }
}
