using Microsoft.AspNetCore.Mvc;

namespace WildFireTracker.wind
{
    [ApiController]
    [Route("api/[controller]")] // api/wind
    public class WindController : ControllerBase
    {
        private readonly WindServices _windService;
        private readonly WindComputationServices _windComputationService;

        public WindController(WindServices windServices, WindComputationServices windComputationServices)
        {
            _windService = windServices;
            _windComputationService = windComputationServices;
        }
        [HttpGet("texture")]
        public async Task<IActionResult> GetWind()
        {
            var points = await _windService.GetWindTextureAsync();
            return File(points, "image/png");
        }
    }
}