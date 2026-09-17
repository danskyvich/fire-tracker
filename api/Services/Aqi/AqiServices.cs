using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace WildFireTracker.aqi
{
    public class AqiServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public AqiServices(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }
        public async Task<byte[]> GetActionResultAsync(int z, int x, int y)
        {
            var client = _httpClientFactory.CreateClient("AqiClient");
            var apiKey = _configuration["AqiApiKey"];
            var aqi = "usepa-aqi";
            var request = new HttpRequestMessage(
                HttpMethod.Get, $"/tiles/{aqi}/{z}/{x}/{y}.png?token={apiKey}"
            )
            {
                Headers =
                {
                    { HeaderNames.Accept, "image/png"},
                    { HeaderNames.UserAgent, "AqiRequest"},
                }
            };

            var response = await client.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException(
                    $"Failed to fetch files from AQICN.org. Sttaus: {response.StatusCode}, Body: {errorBody}"
                );
            }
            return await response.Content.ReadAsByteArrayAsync();
        }
    }
}