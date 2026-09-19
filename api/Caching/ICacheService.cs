namespace WildFireTracker.cache
{
    public interface ICacheService
    {
        Task SetCacheData<T>(string key, T data, TimeSpan time);
        Task<T?> GetCacheData<T>(string key);
        Task DeleteCacheData(string key);
    }
}