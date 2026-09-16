using Microsoft.AspNetCore.Mvc;

namespace WildFireTracker.wind
{
    [ApiController]
    [Route("api/[controller]")] // api/wind
    public class WindController : ControllerBase
    {
        private readonly WindServices _windService;

        public WindController(WindServices windServices)
        {
            _windService = windServices;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var data = await _windService.GetTAsync<List<WindComponent>>();
            return Ok(data);
        }
    }
}