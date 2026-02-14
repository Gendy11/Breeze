using Core.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Breeze.RequestHelpers
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
    public class InvalidateCache(params string[] patterns) : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var resultContext = await next();
            if(resultContext.Exception == null || resultContext.ExceptionHandled)
            {
                var cacheService = context.HttpContext.RequestServices.GetRequiredService<IResponseCacheService>();
                foreach (var pattern in patterns)
                {
                    await cacheService.RemoveCacheByPattern(pattern);
                }
            }
        }
    }
}
