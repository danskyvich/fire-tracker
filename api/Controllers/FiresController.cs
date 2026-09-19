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
        public async Task<IActionResult> Get()
        {
            try
            {
                var fires = await _fireServices.GetFiresAsync();
                return Ok(fires);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, ex.Message);
            }
        }
    }
}
