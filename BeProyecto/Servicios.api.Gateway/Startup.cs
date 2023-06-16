using Microsoft.AspNetCore.Server.Kestrel.Core;
using System.Net;

namespace Servicios.api.Gateway
{
    public class Startup
    {
        public IConfiguration configRoot
        {
            get;
        }
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseStartup<Startup>().ConfigureAppConfiguration((hostingContext, config) =>
        {
            config.AddJsonFile($"ocelot.json");
        });
         webBuilder.ConfigureKestrel(options =>
     {
         var port = 443; //Puerto que queramos
         var pfxFilePath = @"/root/.aspnet/https/gabitel.pfx";
         // The password you specified when exporting the PFX file using OpenSSL.
         // This would normally be stored in configuration or an environment variable;
         // I've hard-coded it here just to make it easier to see what's going on.
         var pfxPassword = "Contraseña";



         options.Listen(IPAddress.Any, port, listenOptions =>
         {
             // Enable support for HTTP1 and HTTP2 (required if you want to host gRPC endpoints)
             listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
             // Configure Kestrel to use a certificate from a local .PFX file for hosting HTTPS
             listenOptions.UseHttps(pfxFilePath, pfxPassword);
         });
     });
 });
        public Startup(IConfiguration configuration)
        {
            configRoot = configuration;
        }
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();
        }
        public void Configure(WebApplication app, IWebHostEnvironment env)
        {
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthorization();
            app.MapRazorPages();
            app.Run();
        }
    }
}
