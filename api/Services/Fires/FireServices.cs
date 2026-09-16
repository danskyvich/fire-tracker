using Microsoft.Net.Http.Headers;

namespace WildFireTracker.fires
{
    public class FireServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private ICSVService _csvService;

        public FireServices(IHttpClientFactory httpClientFactory, IConfiguration configuration, ICSVService cSVService)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _csvService = cSVService;
        }

        public async Task<IEnumerable<FireDetection>> GetFiresAsync()
        {
            var httpClient = _httpClientFactory.CreateClient("FIRMSClient");
            var apiKey = _configuration["NasaFirmsApiKey"];
            var request = new HttpRequestMessage(
                HttpMethod.Get, $"api/area/csv/{apiKey}/VIIRS_SNPP_NRT/world/5"
            )
            {
                Headers =
        {
            { HeaderNames.Accept, "text/csv" },
            { HeaderNames.UserAgent, "FirmsRequest" }
        }
            };

            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException($"Failed to fetch FIRMS data: {response.StatusCode}");

            var csvStream = await response.Content.ReadAsStreamAsync();
            return _csvService.ReadCSV<FireDetection>(csvStream);
        }
    }
}