using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Net.Http.Headers;
using StackExchange.Redis;
using WildFireTracker.cache;

namespace WildFireTracker.fires
{
    public class FireServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private ICSVService _csvService;
        private ICacheService _cacheService;

        public FireServices(IHttpClientFactory httpClientFactory, IConfiguration configuration, ICSVService cSVService, ICacheService cacheService)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _csvService = cSVService;
            _cacheService = cacheService;
        }

        public async Task<IEnumerable<FireDetection>> GetFiresAsync()
        {

            const string cacheKey = "fire:VIIRS_SNPP_NRT:world:5";

            var cacheContent = await _cacheService.GetCacheData<IEnumerable<FireDetection>>(cacheKey);
            if (cacheContent == null)
            {
                // create a http request
                var httpClient = _httpClientFactory.CreateClient("FIRMSClient");
                var apiKey = _configuration["NasaFirmsApiKey"];
                var request = new HttpRequestMessage(HttpMethod.Get, $"api/area/csv/{apiKey}/VIIRS_SNPP_NRT/world/5")
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
                var obj = _csvService.ReadCSV<FireDetection>(csvStream);
                var filteredObj = obj.Where(obj => FireFilters.IsValidFire(obj.bright_ti4, obj.deltaT45, obj.daynight));

                // add to cache
                await _cacheService.SetCacheData(cacheKey, filteredObj, TimeSpan.FromMinutes(15));
                return filteredObj;
            } 
            return cacheContent;
        }
    }
}