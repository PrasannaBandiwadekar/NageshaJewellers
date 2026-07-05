namespace NageshaJewellers.API.Services
{
    // A "hosted service" in .NET is a background task that starts when
    // the application starts and keeps running until it's stopped.
    // This one wakes up every hour, fetches live gold/silver rates,
    // and saves them to the database - with no manual action required.
    public class RateFetcherBackgroundService : BackgroundService
    {
        private readonly MetalRateService _metalRateService;
        private readonly ILogger<RateFetcherBackgroundService> _logger;

        // How often to fetch new rates. 1 hour is appropriate for a
        // jewellery shop - rates don't change fast enough to need more,
        // and GoldAPI's free tier has limited monthly requests.
        private readonly TimeSpan _fetchInterval = TimeSpan.FromHours(1);

        public RateFetcherBackgroundService(
            MetalRateService metalRateService,
            ILogger<RateFetcherBackgroundService> logger)
        {
            _metalRateService = metalRateService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Metal rate fetcher background service started.");

            // Fetch immediately on startup so the database has rates
            // right away (rather than waiting an hour for the first fetch)
            await FetchRatesSafely();

            // Then repeat every hour until the app shuts down
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(_fetchInterval, stoppingToken);
                await FetchRatesSafely();
            }
        }

        private async Task FetchRatesSafely()
        {
            try
            {
                _logger.LogInformation("Fetching latest metal rates...");
                await _metalRateService.FetchAndSaveRatesAsync();
            }
            catch (Exception ex)
            {
                // Catch everything here - we never want the background
                // service to crash the whole application
                _logger.LogError(ex, "Unhandled error in rate fetcher background service.");
            }
        }
    }
}