using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Servicios.api.Gateway;
using System.Net;
using System.Text;


internal class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var startup = new Startup(builder.Configuration);
        
         var builderDef = CreateHostBuilder(args);

         static IHostBuilder CreateHostBuilder(string[] args) =>
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

        // Add services to the container.

        builder.Services.AddControllers();

        builder.Configuration.AddJsonFile($"ocelot.json");

        //builder.Services.AddControllers();
        builder.Services.AddOcelot();
        //key usada para descodificar los tokens
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("mqAaByVDD5Angegb66uIaCW5JSXeiNC0"));
        //el token tiene que estar firmado con la clave que hemos generado
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opt =>
        {
            opt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                //aqui configuramos si cualquiera puede acceder al token
                ValidateAudience = false,
                //verifica desde que dominio se genera el token
                ValidateIssuer = false,
            };
        });
        builder.Services.AddCors(opt =>
        {
            opt.AddPolicy("CorsRule", rule =>
            {
                rule.AllowAnyHeader().AllowAnyMethod().WithOrigins("*");
            });
        });
        //BUILDER2 CORS

         var app2 = builderDef.Build();
        
        
        var app = builder.Build();

        // Configure the HTTP request pipeline.
        app.UseCors("CorsRule");
        app.UseHttpsRedirection();

        app.UseAuthorization();
        await app.UseOcelot();
        app.MapControllers();

        app.Run();
        app2.Run();
    }
}

