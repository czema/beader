namespace Beader {
    public class Program {
        public static void Main(string[] args) {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            app.UseDefaultFiles(new DefaultFilesOptions() {
                DefaultFileNames = new[] { "default.html" }
            });

            app.UseStaticFiles();
            app.MapControllers();

            app.Run();
        }
    }
}