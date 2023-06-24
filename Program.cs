using Microsoft.AspNetCore.Authentication.Cookies;

namespace Beader {
   public class Program {
      public static void Main(string[] args) {
         QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community; // Closed-source software with less than $1M revenue per year.

         var builder = WebApplication.CreateBuilder(args);

         // Add services to the container.
         builder.Services.AddAuthentication(options => {
            options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
         })
         .AddCookie(options => {
            options.LoginPath = "/signin";
            options.LogoutPath = "/signout";
         })
         .AddPaypal(cfg => {
            cfg.ClientId = "";
            cfg.ClientSecret = "";
            cfg.CallbackPath = "/auth/callback";
            cfg.Scope.Clear();
            cfg.Scope.Add("openid");
            cfg.Scope.Add("profile");
            cfg.CorrelationCookie.SameSite = SameSiteMode.Lax;

            // Sandbox.
            if (true) {
               cfg.AuthorizationEndpoint = "https://www.sandbox.paypal.com/webapps/auth/protocol/openidconnect/v1/authorize";
               cfg.TokenEndpoint = "https://api.sandbox.paypal.com/v1/identity/openidconnect/tokenservice";
               cfg.UserInformationEndpoint = "https://api.sandbox.paypal.com/v1/identity/oauth2/userinfo";
            }
         });

         builder.Services.AddControllersWithViews();

         var app = builder.Build();

         // Configure the HTTP request pipeline.
         app.UseDeveloperExceptionPage();
         app.UseStaticFiles();
         app.UseAuthentication();
         app.UseAuthorization();
         app.MapControllers();

         app.Run();
      }
   }
}