using Microsoft.AspNetCore.Mvc;
using NageshaJewellers.API.Services;

namespace NageshaJewellers.API.Controllers
{
    // Base URL: /api/rates
    // Public endpoint - no login needed, anyone can see today's gold/silver rate
    [ApiController]
    [Route("api/rates")]
    public class RatesController : ControllerBase
    {
        private readonly MetalRateService _metalRateService;

        public RatesController(MetalRateService metalRateService)
        {
            _metalRateService = metalRateService;
        }

        // GET /api/rates
        // Returns today's gold and silver rates per gram in INR
        // Used by the React banner at the top of the shop pages
        [HttpGet]
        public async Task<IActionResult> GetRates()
        {
            var rates = await _metalRateService.GetAllRatesAsync();

            if (!rates.Any())
            {
                return Ok(new { message = "Rates not yet available. Check back shortly.", rates = new List<object>() });
            }

            var result = rates.Select(r => new
            {
                metalType = r.MetalType,
                ratePerGram = r.RatePerGram,
                fetchedAt = r.FetchedAt
            });

            return Ok(result);
        }
    }
}