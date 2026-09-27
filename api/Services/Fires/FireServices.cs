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

        public async Task<IEnumerable<FireDetection>> GetFiresAsync(string bbox, bool downsample)
        {
            var cacheKey = $"fire:VIIRS_ALL:{bbox}:{(downsample ? "ds" : "full")}:2";

            var cacheContent = await _cacheService.GetCacheData<IEnumerable<FireDetection>>(cacheKey);
            if (cacheContent == null)
            {
                // create a http request
                var httpClient = _httpClientFactory.CreateClient("FIRMSClient");
                var apiKey = _configuration["NasaFirmsApiKey"];
                
                var sources = new[] {$"VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT"};
                var allFires = new List<FireDetection>();

                try
                {
                    foreach (string source in sources)
                    {
                        var request = new HttpRequestMessage(HttpMethod.Get, $"api/area/csv/{apiKey}/{source}/{bbox}/2")
                        {
                            Headers =
                        {
                            {HeaderNames.Accept, "text/csv"},
                            {HeaderNames.UserAgent, "FirmsRequest"},
                        }
                        };

                        var response = await httpClient.SendAsync(request);
                        if (!response.IsSuccessStatusCode)
                            throw new HttpRequestException("Failed to fetch data from FIRMS");

                        var csvStream = await response.Content.ReadAsStreamAsync();
                        allFires.AddRange(_csvService.ReadCSV<FireDetection>(csvStream));
                    }
                } catch (Exception ex)
                {
                    throw new Exception($"Error encountered: {ex.Message}, {ex.GetBaseException().Message}");
                }

                var filteredObj = allFires.Where(item => FireFilters.IsValidFire(item.bright_ti4, item.deltaT45, item.daynight));
                var filteredObjResult = downsample ? DownsampleByGrid(filteredObj, cellSizeDegrees: 2.0) : filteredObj.ToList();

                //set cache
                await SetCacheData(cacheKey, filteredObjResult, 15);
                return filteredObjResult;
            } 
            return cacheContent;
        }
        private static IEnumerable<FireDetection> DownsampleByGrid(IEnumerable<FireDetection> fires, double cellSizeDegrees)
        {
            return fires
                .GroupBy(f => (
                    Lat: Math.Floor(f.latitude / cellSizeDegrees) * cellSizeDegrees,
                    Lon: Math.Floor(f.longitude / cellSizeDegrees) * cellSizeDegrees
                ))
                .Select(g => g.OrderByDescending(f => f.bright_ti4).First()) // strongest fire per cell
                .ToList();
        }

        private async Task SetCacheData(string key, IEnumerable<FireDetection> data, int time)
        {
            await _cacheService.SetCacheData(key, data, TimeSpan.FromMinutes(time));
        }
    }
}