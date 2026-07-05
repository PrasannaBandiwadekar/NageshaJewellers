namespace NageshaJewellers.API.Models
{
    // One row per metal type in the MetalRates table.
    // Stores the most recently fetched price per gram in INR.
    public class MetalRate
    {
        public int MetalRateId { get; set; }
        public string MetalType { get; set; } = string.Empty; // Gold22k, Gold18k, Silver
        public decimal RatePerGram { get; set; }
        public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
    }
}