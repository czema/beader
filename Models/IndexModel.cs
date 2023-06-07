using System.Security.Claims;

namespace Beader.Models;

public class IndexModel
   : LayoutModel {

   public IndexModel(ClaimsPrincipal principal) : base(principal) { }
}
