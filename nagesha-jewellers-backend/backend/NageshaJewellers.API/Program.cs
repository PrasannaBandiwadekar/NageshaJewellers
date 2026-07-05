using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.Services;

// ===========================================================================
// PROGRAM.CS - this is the file that STARTS UP the whole backend.
// Think of it as the "main switch panel" - it wires together the database,
// the login system, and tells the API which websites are allowed to call it.
// You don't need to edit this file again once it's set up correctly.
// ===========================================================================

var builder = WebApplication.CreateBuilder(args);

// ---------- 1. Connect to SQL Server ----------
// "DefaultConnection" is read from appsettings.json (the file right next to this one)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---------- 2. Register our own services so controllers can use them ----------
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<RazorpayService>();
builder.Services.AddScoped<EmailService>();

// ---------- 3. Set up login security (JWT) ----------
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// ---------- 4. Allow the React website to call this API ----------
// Browsers block websites from calling APIs on a different address unless
// the API explicitly allows it. This is called "CORS". During development,
// Vite sometimes picks a different port (5173, 5174, 5175...) if the usual
// one is already busy - so instead of listing one fixed port, we allow any
// "http://localhost:ANYTHING" address. This is safe for local development;
// when you publish the real site later, change this to your actual website
// address instead (see the comment further below).
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrEmpty(origin)) return false;
                  var uri = new Uri(origin);
                  // Allow ANY port on localhost/127.0.0.1 (covers Vite's
                  // 5173, 5174, 5175... and CRA's 3000, etc.)
                  return uri.Host == "localhost" || uri.Host == "127.0.0.1";
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();

        // ---- WHEN YOU GO LIVE (publish the real site) ----
        // Replace the block above with something like this instead,
        // using your actual published website address:
        //
        // policy.WithOrigins("https://www.nageshajewellers.com")
        //       .AllowAnyHeader()
        //       .AllowAnyMethod();
    });
});

// ---------- 5. Standard API + Swagger (a free built-in test page) ----------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Nagesha Jewellers API", Version = "v1" });

    // This adds a padlock icon in Swagger so you can paste in a JWT token
    // and test the "logged in only" endpoints directly from the browser.
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Paste your token here. Example: Bearer eyJhbGciOiJ..."
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// Metal rate service - fetches live gold/silver rates from GoldAPI
builder.Services.AddSingleton<MetalRateService>();

// Background job that calls MetalRateService every hour automatically
builder.Services.AddHostedService<RateFetcherBackgroundService>();

var app = builder.Build();

// ---------- 6. Turn on Swagger so you can visit /swagger in your browser ----------
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowReactApp"); // must come before auth/controllers

app.UseAuthentication(); // checks "who are you" (reads the JWT token)
app.UseAuthorization();  // checks "are you allowed to do this" (checks Role)

app.MapControllers(); // turns on all our [ApiController] classes

app.Run();
