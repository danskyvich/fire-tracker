using Microsoft.Net.Http.Headers;
using WildFireTracker.cache;

namespace WildFireTracker.wind
{
    public class WindServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ICacheService _cacheService;
        private readonly WindComputationServices _computationService;
        public record WindTextureResult(byte[] ImageBytes, float UMin, float UMax, float VMin, float VMax, float Lo1, float Lo2, float La1, float La2);

        public WindServices(IHttpClientFactory httpClientFactory, IConfiguration configuration, ICacheService cacheService, WindComputationServices computationServices)
        {
            _httpClientFactory = httpClientFactory;
            _cacheService = cacheService;
            _computationService = computationServices;
        }

        public async Task<List<WindComponent>> GetWindComponentsAsync()
        {
            var key = "wind:noaa-docker";

            var cacheContent = await _cacheService.GetCacheData<List<WindComponent>>(key);

            if (cacheContent == null)
            {
                // create a http request
                var httpClient = _httpClientFactory.CreateClient("WindClient");
                var url = "/latest";
                var request = new HttpRequestMessage(
                    HttpMethod.Get, url
                )
                {
                    Headers =
                    {
                        { HeaderNames.UserAgent, "WindRequest" }
                    }
                };

                var response = await httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode) throw new HttpRequestException($"Failed to fetch OpenWeatherMap data: {response.StatusCode}");
                var result = await response.Content.ReadFromJsonAsync<List<WindComponent>>();
                if (result is null) throw new InvalidOperationException("Deserialized JSON is null");

                // add to cache
                await _cacheService.SetCacheData(key, result, TimeSpan.FromMinutes(10));

                return result;
            }
            return cacheContent;
        }

        public async Task<WindTextureResult> GetWindTextureAsync()
        {
            const string computedCacheKey = "wind:computed:noaa-docker";
            var cached = await _cacheService.GetCacheData<(byte[] bytes, float uMin, float uMax, float vMin, float vMax, float lo1, float lo2, float la1, float la2)>(computedCacheKey);

            var components = await GetWindComponentsAsync();
            var uComponents = components.First(c => c.header.parameterNumber == 2);
            var vComponents = components.First(c => c.header.parameterNumber == 3);

            var (bytes, uMin, uMax, vMin, vMax, lo1, lo2, la1, la2) = _computationService.GenerateWindTexture(uComponents, vComponents);
            var result = new WindTextureResult(bytes, uMin, uMax, vMin, vMax, lo1, lo2, la1, la2);

            await _cacheService.SetCacheData(computedCacheKey, result, TimeSpan.FromMinutes(10));
            return result;
        }
    }
}