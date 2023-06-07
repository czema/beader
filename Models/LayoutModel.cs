using System.Security.Claims;

namespace Beader.Models;

public class LayoutModel {

   public string? Name { get; private set; }

   public LayoutModel(ClaimsPrincipal principal) {
      var authenticated = principal.Identity?.IsAuthenticated ?? false;

      if (authenticated) {
         this.Name = principal.Identity?.Name;
      }
   }

}
