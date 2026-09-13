using ApiCsvParser;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

[ApiController]
[Route("api/[controller]")]
public class FiresController: ControllerBase
{
    private readonly FirmsService _firmsService;

    public FiresController(FirmsService firmsService)
    {
        _firmsService = firmsService;
    }


    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var fires = await _firmsService.GetFiresAsync();
            return Ok(fires);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, ex.Message);
        }
    }
}