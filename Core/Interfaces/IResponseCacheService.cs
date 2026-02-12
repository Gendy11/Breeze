using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IResponseCacheService
    {
        Task CacheResponeAsync(string cacheKey, object response, TimeSpan timeToLive);
        Task<string?> GetCachedResponseAsync(string cacheKey);
        Task RemoveCacheByPattern(string pattern);
    }   
}
