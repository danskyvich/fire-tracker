using Microsoft.AspNetCore.Mvc;

namespace WildFireTracker.aqi
{
    [ApiController]
    [Route("api/[controller]")]
    public class AqiController : ControllerBase
    {
        private readonly AqiServices _aqiServices;
        public AqiController(AqiServices aqiServices)
        {
            _aqiServices = aqiServices;
        }
        [HttpGet("tiles/{z}/{x}/{y}")]
        public async Task<IActionResult> Get(int z, int x, int y)
        {
            try
            {
                var tileBytes = await _aqiServices.GetActionResultAsync(z,x,y);
                return File(tileBytes, "image/png");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, ex.Message);
            }
        }
    }
}