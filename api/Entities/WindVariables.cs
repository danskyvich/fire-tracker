namespace WildFireTracker.wind
{
    public class WindVariables
    {
        public int nx { get; set; }
        public int ny { get; set; }
        public int dx { get; set; }
        public int dy { get; set; }
        public double lo1 { get; set;}
        public double la1 { get; set; }
        public double lo2 { get; set; }
        public double la2 { get; set; }
        public int parameterNumber { get; set; }
        public DateTime refTime { get; set; }
    }

    public class WindComponent
    {
        public WindVariables header { get; set; } = null!;
        public double[] data { get; set; } = [];
    }
}