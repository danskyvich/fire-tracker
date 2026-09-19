using Microsoft.Net.Http.Headers;
using WildFireTracker.cache;

namespace WildFireTracker.wind
{
    public class WindServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ICacheService _cacheService;

        public WindServices(IHttpClientFactory httpClientFactory, IConfiguration configuration, ICacheService cacheService)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _cacheService = cacheService;
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
    }
}