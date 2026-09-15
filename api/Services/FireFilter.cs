namespace api
{
    public class FireFilters
    {
        public static bool IsValidFire(double bright_ti4, double delta_T45, string side)
        {
            return (side == "D" && bright_ti4 > 325 && delta_T45 > 25) ||
                    (side == "N" && bright_ti4 > 295 && delta_T45 > 10);
        } 
    }
}