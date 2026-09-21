using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WildFireTracker.fires;

namespace WildFireTracker.search
{
    [ApiController]
    [Route("api/[controller]")]
    public class FireDetectionsController : ControllerBase
    {
        private readonly DatabaseContext _databaseContext;
        public FireDetectionsController(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
        }
        [HttpGet("search")]
        public async Task<ActionResult<List<FireDetection>>> SearchAsync(double? minLat, double? maxLat, double? minLon, double? maxLon, DateTime? from, DateTime? to, string? confidence, CancellationToken cancellationToken)
        {
            IQueryable<FireDetectionParsing> query = _databaseContext.FireDetections;
            if (minLat.HasValue) query = query.Where(item => item.latitude >= minLat.Value);
            if (maxLat.HasValue) query = query.Where(item => item.latitude <= maxLat.Value);
            if (minLon.HasValue) query = query.Where(item => item.longitude >= minLon.Value);
            if (maxLon.HasValue) query = query.Where(item => item.longitude <= maxLon.Value);
            if (from.HasValue) query = query.Where(item => item.acquired_at >= from.Value);
            if (to.HasValue) query = query.Where(item => item.acquired_at <= to.Value);
            if (!string.IsNullOrEmpty(confidence)) query = query.Where(item => item.confidence == confidence);

            var results = await query.ToListAsync(cancellationToken);
            
            var mapped = results.Select(item => new FireDetection
            {
                latitude = item.latitude,
                longitude = item.longitude,
                bright_ti4 = item.bright_ti4,
                bright_ti5 = item.bright_ti5,
                confidence = item.confidence,
                satellite = item.satellite,
                acq_date = item.acq_date,
                acq_time = item.acq_time,
                frp = item.frp,
                daynight = item.daynight,
                acquired_at = item.acquired_at,

            }).ToList();

            return Ok(mapped);
        }
    }
}