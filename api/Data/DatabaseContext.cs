using Microsoft.EntityFrameworkCore;
using WildFireTracker.fires;

namespace WildFireTracker.search
{
    public class DatabaseContext : DbContext
    {
        public DbSet<FireDetectionParsing> FireDetections { get; set; }
        public DatabaseContext(DbContextOptions<DatabaseContext> options): base(options){}
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<FireDetectionParsing>()
                .HasIndex(f => new { f.latitude, f.longitude, f.acquired_at, f.satellite })
                .IsUnique();
        }
    }
}