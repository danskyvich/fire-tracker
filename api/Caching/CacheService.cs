using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace WildFireTracker.cache
{
    public class CacheService : ICacheService
    {
        private readonly IDistributedCache _cache;
        public CacheService(IDistributedCache cache)
        {   
            _cache = cache;
        }
        public async Task SetCacheData<T>(string key, T data, TimeSpan time)
        {            
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = time
            };
            var jsonData = JsonSerializer.Serialize(data);
            await _cache.SetStringAsync(key, jsonData, options);
        }

        public async Task<T?> GetCacheData<T>(string key)
        {
            var data = await _cache.GetStringAsync(key);
            if (data is null) return default(T);
            var jsonData = JsonSerializer.Deserialize<T>(data);
            return jsonData;
        }

        public async Task DeleteCacheData(string key)
        {
            await _cache.RemoveAsync(key);

        }

    }
}