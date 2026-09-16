using Microsoft.Net.Http.Headers;

namespace WildFireTracker.wind
{
    public class WindServices
    {
        public readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public WindServices(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<T> GetTAsync<T>()
        {
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
            var result = await response.Content.ReadFromJsonAsync<T>();
            if (result is null) throw new InvalidOperationException("Deserialized JSON is null");
            return result;
        }
    }
}