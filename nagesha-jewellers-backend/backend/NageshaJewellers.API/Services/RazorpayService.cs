using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace NageshaJewellers.API.Services
{
    // This class talks to Razorpay (the payment company) on our behalf.
    // Two jobs:
    //   1. Create a "Razorpay order" before showing the payment popup
    //   2. Verify the payment was real (not faked) after it completes
    public class RazorpayService
    {
        private readonly string _keyId;
        private readonly string _keySecret;
        private readonly HttpClient _httpClient;

        public RazorpayService(IConfiguration config)
        {
            _keyId = config["Razorpay:KeyId"]!;
            _keySecret = config["Razorpay:KeySecret"]!;
            _httpClient = new HttpClient { BaseAddress = new Uri("https://api.razorpay.com/v1/") };

            var authBytes = Encoding.UTF8.GetBytes($"{_keyId}:{_keySecret}");
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));
        }

        public string KeyId => _keyId;

        // Step 1 of payment: ask Razorpay to "reserve" an order for this amount
        public async Task<string> CreateRazorpayOrderAsync(decimal amountInRupees, string receiptId)
        {
            var payload = new
            {
                amount = (int)(amountInRupees * 100), // Razorpay wants amount in paise (1 rupee = 100 paise)
                currency = "INR",
                receipt = receiptId
            };

            var response = await _httpClient.PostAsync("orders",
                new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            return doc.RootElement.GetProperty("id").GetString()!; // this is the "razorpay_order_id"
        }

        // Step 2 of payment: after the customer pays, Razorpay sends back a
        // "signature". We re-calculate our own signature with the secret key
        // and check they match - this proves the payment wasn't faked by
        // someone tampering with the browser request.
        public bool VerifySignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature)
        {
            var payload = $"{razorpayOrderId}|{razorpayPaymentId}";
            var keyBytes = Encoding.UTF8.GetBytes(_keySecret);
            var payloadBytes = Encoding.UTF8.GetBytes(payload);

            using var hmac = new HMACSHA256(keyBytes);
            var hash = hmac.ComputeHash(payloadBytes);
            var generatedSignature = Convert.ToHexString(hash).ToLower();

            return generatedSignature == razorpaySignature.ToLower();
        }
    }
}
