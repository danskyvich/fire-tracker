using System.Net;
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
        [HttpGet("texture")]
        public async Task<IActionResult> GetWind()
        {
            try
            {
                var (bytes, uMin, uMax, vMin, vMax, lo1, lo2, la1, la2) = await _windService.GetWindTextureAsync();
                Response.Headers["X-Wind-UMin"] = uMin.ToString(System.Globalization.CultureInfo.InvariantCulture);
                Response.Headers["X-Wind-UMax"] = uMax.ToString(System.Globalization.CultureInfo.InvariantCulture);
                Response.Headers["X-Wind-VMin"] = vMin.ToString(System.Globalization.CultureInfo.InvariantCulture);
                Response.Headers["X-Wind-VMax"] = vMax.ToString(System.Globalization.CultureInfo.InvariantCulture);
                Response.Headers["X-Wind-Lo1"] = lo1.ToString(System.Globalization.CultureInfo.InvariantCulture);
                Response.Headers["X-Wind-Lo2"] = lo2.ToString(System.Globalization.CultureInfo.InvariantCulture);
                Response.Headers["X-Wind-La1"] = la1.ToString(System.Globalization.CultureInfo.InvariantCulture);
                Response.Headers["X-Wind-La2"] = la2.ToString(System.Globalization.CultureInfo.InvariantCulture);
                return File(bytes, "image/png");
            } catch (HttpRequestException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}