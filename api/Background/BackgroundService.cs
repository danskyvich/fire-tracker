using System.Globalization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Net.Http.Headers;
using WildFireTracker.fires;

namespace WildFireTracker.search
{
    public class TimedBackgroundService : BackgroundService
    {
        private readonly ILogger<TimedBackgroundService> _logger;
        private readonly IHttpClientFactory _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        public TimedBackgroundService(ILogger<TimedBackgroundService> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory, IServiceScopeFactory serviceScopeFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClientFactory;
            _serviceScopeFactory = serviceScopeFactory;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(TimeSpan.FromSeconds(15));
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    await SearchAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while performing search function");
                }
            }
        }

        private async Task SearchAsync(CancellationToken cancellationToken)
        {
            // logic
            var client = _httpClient.CreateClient("FIRMSClient");
            var apiKey = _configuration["NasaFirmsApiKey"];
            var request = new HttpRequestMessage(
                HttpMethod.Get, $"api/area/csv/{apiKey}/VIIRS_SNPP_NRT/world/5"
            )
            {
                Headers =
                {
                    { HeaderNames.Accept, "text/csv"},
                    { HeaderNames.UserAgent, "FirmsRequestSecond"}
                }
            };

            using var response = await client.SendAsync(request, cancellationToken);
            await using var scope = _serviceScopeFactory.CreateAsyncScope();
            var csvService = scope.ServiceProvider.GetRequiredService<ICSVService>();
            if (!response.IsSuccessStatusCode) 
                throw new HttpRequestException("Failed fetching data from NASA FIRMS");
            using var csvStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var obj = csvService.ReadCSV<FireDetectionParsing>(csvStream);

            var dbContext = scope.ServiceProvider.GetRequiredService<DatabaseContext>();

            var enrichedList = parseCsvObject(obj);

            await SaveNewDetectionAsync(dbContext, cancellationToken, enrichedList);

            return;
        }

        private async Task SaveNewDetectionAsync(DatabaseContext databaseContext, CancellationToken cancellationToken, List<FireDetectionParsing> enrichedList)
        {
            if (enrichedList.Count == 0) return;
            var minValue = enrichedList.Min(item => item.acquired_at);
            var maxValue = enrichedList.Max(item => item.acquired_at);

            var existing = await databaseContext.FireDetections
                .Where(item => item.acquired_at >= minValue && item.acquired_at <= maxValue)
                .Select(item => new { item.latitude, item.longitude, item.acquired_at, item.satellite} )
                .ToListAsync(cancellationToken);
            
            var existingKeys = new HashSet<(double latitude, double longitude, DateTime acquired_at, string Satellite)>((existing.Select(item => (item.latitude, item.longitude, item.acquired_at, item.satellite))));

            var enrichedItem = enrichedList.Where(item => {
                var tuple = (item.latitude, item.longitude, item.acquired_at, item.satellite);
                if (existingKeys.Contains<(double latitude, double longitude, DateTime acquired_at, string satellite)>(tuple))
                {
                    return false;
                } else
                {
                    return true;
                }
            }).ToList();

            if (enrichedItem.Count == 0) return;
            databaseContext.FireDetections.AddRange(enrichedItem);
            await databaseContext.SaveChangesAsync(cancellationToken);
        }

        private List<FireDetectionParsing> parseCsvObject(IEnumerable<FireDetectionParsing> listToParse)
        {
            var finalizedObject = listToParse.Select(item =>
            {
                var getItem = item.acq_time;
                var acquired_date = item.acq_date;
                var paddedString = getItem.PadLeft(4, '0');
                int.TryParse(paddedString.Substring(0, 2), out int leftResult);
                int.TryParse(paddedString.Substring(2, 2), out int rightResult);
                item.acquired_at = new DateTime(acquired_date.Year, acquired_date.Month, acquired_date.Day, leftResult, rightResult, 0, DateTimeKind.Utc);
                return item;

            }).ToList();
           
            return finalizedObject;
        }
    }
}