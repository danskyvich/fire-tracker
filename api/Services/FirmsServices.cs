// declare the shape of the class

using System.Globalization;
using CsvHelper;
using System.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Net.Http.Headers;

namespace ApiCsvParser
{
    public interface ICSVService
    {
        public IEnumerable<T> ReadCSV<T>(Stream file);
    }

    public class FireDetection
    {
        public double latitude { get; set; }
        public double longitude { get; set; }
        public double bright_ti4 { get; set; }
        public required string confidence { get; set; }
        public DateTime acq_date { get; set; }
        public string acq_time { get; set; }
    }   
   public class CSVService: ICSVService
    {
        public IEnumerable<T> ReadCSV<T>(Stream file)
        {
            using var reader = new StreamReader(file);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = csv.GetRecords<T>();
            return records.ToList();
        }
    }
    public class FirmsService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ICSVService _csvService;

        private readonly IConfiguration _configuration;

        public FirmsService(IHttpClientFactory httpClientFactory, ICSVService csvService, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _csvService = csvService;
            _configuration = configuration;
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
            return _csvService.ReadCSV<FireDetection>(csv);
        }
    }
}