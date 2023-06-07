using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace Beader.Controllers;

[ApiController]
public class AuthController : Controller {

    [HttpGet("~/signin")]
    public IActionResult SignIn() {
        // Instruct the middleware corresponding to the requested external identity
        // provider to redirect the user agent to its own authorization endpoint.
        // Note: the authenticationScheme parameter must match the value configured in Startup.cs

        return Challenge(new AuthenticationProperties { RedirectUri = "/" }, "Paypal");
    }

    [HttpGet("~/signout")]
    [HttpPost("~/signout")]
    public IActionResult SignOutCurrentUser() {
        // Instruct the cookies middleware to delete the local cookie created
        // when the user agent is redirected from the external identity provider
        // after a successful authentication flow (e.g Google or Facebook).
        return SignOut(new AuthenticationProperties { RedirectUri = "/" },
            CookieAuthenticationDefaults.AuthenticationScheme);
    }
}
