using Microsoft.Net.Http.Headers;
using WildFireTracker.cache;

namespace WildFireTracker.wind
{
    public class WindServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ICacheService _cacheService;
        private readonly WindComputationServices _computationService;

        public WindServices(IHttpClientFactory httpClientFactory, IConfiguration configuration, ICacheService cacheService, WindComputationServices computationServices)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
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

        public async Task<byte[]> GetWindTextureAsync()
        {
            const string computedCacheKey = "wind:computed:noaa-docker";
            var cached = await _cacheService.GetCacheData<byte[]>(computedCacheKey);
            if (cached != null) return cached;

            var components = await GetWindComponentsAsync();
            var uComponents = components.First(c => c.header.parameterNumber == 2);
            var vComponents = components.First(c => c.header.parameterNumber == 3);

            var textureBytes = _computationService.GenerateWindTexture(uComponents, vComponents);
            await _cacheService.SetCacheData(computedCacheKey, textureBytes, TimeSpan.FromMinutes(10));
            return textureBytes;
        }
    }
}