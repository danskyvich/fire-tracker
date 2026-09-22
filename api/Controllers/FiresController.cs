using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace WildFireTracker.fires
{
    [ApiController]
    [Route("api/[controller]")]
    public class FiresController : ControllerBase
    {
        private readonly FireServices _fireServices;

        public FiresController(FireServices fireServices)
        {
            _fireServices = fireServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string bbox)
        {
            if (string.IsNullOrWhiteSpace(bbox))
                return BadRequest("bbox is required");

            try
            {
                var parts = bbox.Split(',').Select(double.Parse).ToArray();
                var lonSpan = parts[2] - parts[0];
                var isWorldView = lonSpan > 180;

                var fires = await _fireServices.GetFiresAsync(bbox, downsample: isWorldView);
                return Ok(fires);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, ex.Message);
            }
            catch (FormatException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
