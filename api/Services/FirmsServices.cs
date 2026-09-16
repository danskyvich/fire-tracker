// FirmsService.cs
using Microsoft.Net.Http.Headers;
using System.Linq;

namespace WildFireTracker.fires
{
    public class FirmsService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ICSVService _csvService;

        public FirmsService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ICSVService csvService)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _csvService = csvService;
        }
        public async Task<IEnumerable<FireDetection>> GetFiresAsync()
        {
            var httpClient = _httpClientFactory.CreateClient("FIRMSClient");
            var apiKey = _configuration["NasaFirmsApiKey"] ?? throw new InvalidOperationException("NasaFirmsApiKey environment variable is not set.");
            var request = new HttpRequestMessage(
                HttpMethod.Get, $"api/area/csv/{apiKey}/VIIRS_SNPP_NRT/world/5"
            )
            {
                Headers =
                {
                    { HeaderNames.Accept, "text/csv"},
                    { HeaderNames.UserAgent, "FirmsRequest"}
                }
            };
            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode) throw new HttpRequestException($"Failed to fetch FIRMS data: {response.StatusCode}");

            var csv = await response.Content.ReadAsStreamAsync();

            var fires = _csvService.ReadCSV<FireDetection>(csv);

            return fires.Where(fire => FireFilters.IsValidFire(fire.bright_ti4, fire.deltaT45, fire.daynight));
        }
    }
}