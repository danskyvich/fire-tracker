using System.Globalization;
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

        private const double TileSize = 45.0;

        public async Task<IEnumerable<FireDetection>> GetFiresAsync(string bbox, bool downsample)
        {
            var p = bbox.Split(',').Select(s => double.Parse(s, CultureInfo.InvariantCulture)).ToArray();
            double west = Math.Clamp(p[0], -180, 180), south = Math.Clamp(p[1], -90, 90),
                   east = Math.Clamp(p[2], -180, 180), north = Math.Clamp(p[3], -90, 90);

            var tileTasks = new List<Task<List<FireDetection>>>();
            for (var lon = Math.Floor(west / TileSize) * TileSize; lon < east; lon += TileSize)
                for (var lat = Math.Floor(south / TileSize) * TileSize; lat < north; lat += TileSize)
                    tileTasks.Add(GetTileAsync(lon, lat));

            var fires = (await Task.WhenAll(tileTasks))
                .SelectMany(t => t)
                .Where(f => f.longitude >= west && f.longitude <= east
                         && f.latitude >= south && f.latitude <= north);

            return downsample ? DownsampleByGrid(fires, cellSizeDegrees: 2.0) : fires.ToList();
        }

        private async Task<List<FireDetection>> GetTileAsync(double west, double south)
        {
            var tileBbox = string.Create(CultureInfo.InvariantCulture,
                $"{west},{south},{west + TileSize},{south + TileSize}");
            var cacheKey = $"fire:VIIRS_ALL:tile:{tileBbox}:2";

            var cached = await _cacheService.GetCacheData<List<FireDetection>>(cacheKey);
            if (cached != null) return cached;

            var httpClient = _httpClientFactory.CreateClient("FIRMSClient");
            var apiKey = _configuration["NasaFirmsApiKey"];

            var sources = new[] { "VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT" };
            var allFires = new List<FireDetection>();

            try
            {
                foreach (string source in sources)
                {
                    var request = new HttpRequestMessage(HttpMethod.Get, $"api/area/csv/{apiKey}/{source}/{tileBbox}/2")
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
            }
            catch (Exception ex)
            {
                throw new Exception($"Error encountered: {ex.Message}, {ex.GetBaseException().Message}");
            }

            var valid = allFires
                .Where(item => FireFilters.IsValidFire(item.bright_ti4, item.deltaT45, item.daynight))
                .ToList();

            await SetCacheData(cacheKey, valid, 15);
            return valid;
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