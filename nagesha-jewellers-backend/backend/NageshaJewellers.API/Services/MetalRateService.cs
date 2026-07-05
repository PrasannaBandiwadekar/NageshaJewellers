using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.Models;

namespace NageshaJewellers.API.Services
{
    // This service has one job: fetch the current gold and silver rate
    // from GoldAPI.io and store it in our own MetalRates table.
    // We store it locally so that:
    //   1. Product pages load instantly (no waiting for external API)
    //   2. We don't hit GoldAPI's rate limit by calling it on every page load
    //   3. If GoldAPI is temporarily down, we still show the last known rate
    public class MetalRateService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<MetalRateService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        // We use IServiceScopeFactory instead of AppDbContext directly
        // because this service is used as a "singleton" background service
        // but AppDbContext is "scoped" (created per request). This pattern
        // is the correct way to use a scoped service from a singleton.
        public MetalRateService(
            IConfiguration config,
            ILogger<MetalRateService> logger,
            IServiceScopeFactory scopeFactory)
        {
            _config = config;
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        // Fetches the latest rates and saves them to the database.
        // Called by the background job every hour.
        public async Task FetchAndSaveRatesAsync()
        {
            var apiKey = _config["GoldApi:ApiKey"];
            var baseUrl = _config["GoldApi:BaseUrl"] ?? "https://www.goldapi.io/api/";

            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "PASTE_YOUR_GOLDAPI_KEY_HERE")
            {
                _logger.LogWarning("GoldAPI key not configured. Skipping rate fetch.");
                return;
            }

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("x-access-token", apiKey);

            // XAU = gold, XAG = silver (standard commodity symbols)
            // We fetch both, in INR
            await FetchAndSaveMetalAsync(httpClient, baseUrl, "XAU", "INR");
            await FetchAndSaveMetalAsync(httpClient, baseUrl, "XAG", "INR");
        }

        private async Task FetchAndSaveMetalAsync(
            HttpClient httpClient, string baseUrl, string metalSymbol, string currency)
        {
            try
            {
                var url = $"{baseUrl}{metalSymbol}/{currency}";
                var response = await httpClient.GetStringAsync(url);
                using var doc = JsonDocument.Parse(response);
                var root = doc.RootElement;

                // GoldAPI returns price_gram_22k and price_gram_18k for gold,
                // and price_gram_24k for silver (silver has no karats as such)
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                if (metalSymbol == "XAU")
                {
                    var rate22k = root.GetProperty("price_gram_22k").GetDecimal();
                    var rate18k = root.GetProperty("price_gram_18k").GetDecimal();

                    await UpsertRateAsync(context, "Gold22k", rate22k);
                    await UpsertRateAsync(context, "Gold18k", rate18k);

                    _logger.LogInformation(
                        "Gold rates updated: 22k = ₹{Rate22k}/g, 18k = ₹{Rate18k}/g",
                        rate22k, rate18k);
                }
                else if (metalSymbol == "XAG")
                {
                    var rateSilver = root.GetProperty("price_gram_24k").GetDecimal();
                    await UpsertRateAsync(context, "Silver", rateSilver);

                    _logger.LogInformation("Silver rate updated: ₹{Rate}/g", rateSilver);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch {Metal} rate from GoldAPI", metalSymbol);
                // We intentionally don't rethrow - if the API call fails, we
                // just keep the last saved rate and try again next hour
            }
        }

        // "Upsert" = Update if exists, Insert if not.
        // Each metal type has exactly one row, updated in place every hour.
        private static async Task UpsertRateAsync(
            AppDbContext context, string metalType, decimal ratePerGram)
        {
            var existing = await context.MetalRates
                .FirstOrDefaultAsync(r => r.MetalType == metalType);

            if (existing != null)
            {
                existing.RatePerGram = ratePerGram;
                existing.FetchedAt = DateTime.UtcNow;
            }
            else
            {
                context.MetalRates.Add(new MetalRate
                {
                    MetalType = metalType,
                    RatePerGram = ratePerGram,
                    FetchedAt = DateTime.UtcNow
                });
            }

            await context.SaveChangesAsync();
        }

        // Returns the current stored rate for a given metal type.
        // Called by ProductsController when calculating product prices.
        public async Task<decimal?> GetRateAsync(string metalType)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var rate = await context.MetalRates
                .FirstOrDefaultAsync(r => r.MetalType == metalType);

            return rate?.RatePerGram;
        }

        // Returns all current rates - used by the /api/rates endpoint
        // that the React banner reads to display today's rates
        public async Task<List<MetalRate>> GetAllRatesAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            return await context.MetalRates.ToListAsync();
        }
    }
}