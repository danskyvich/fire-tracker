namespace WildFireTracker.fires
{
    public class FireDetectionParsing
    {
        public double latitude { get; set; }
        public double longitude { get; set; }
        public double bright_ti4 { get; set; }
        public double bright_ti5 { get; set; }
        public required string confidence { get; set; } // l,n,h
        public DateTime acq_date { get; set; }
        public required string acq_time { get; set; }
        public DateTime acquired_at { get; set; }
        public required string satellite { get; set; }
        public double frp { get; set; }
        public required string daynight { get; set; } // D or N 
        public int Id { get; set; }
    }
}