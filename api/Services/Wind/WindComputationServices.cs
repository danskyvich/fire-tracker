using System;
using SkiaSharp;

namespace WildFireTracker.wind
{
    // describe the final result
    public readonly struct WindTexture
    {
        public readonly float Lat, Lon, Speed, Direction;
        public WindTexture(float lat, float lon, float speed, float direction)
        => (Lat, Lon, Speed, Direction) = (lat, lon, speed, direction);
    }

    // actual computational logic
    public class WindComputationServices
    {
        public (byte[] ImageBytes, float uMin, float uMax, float vMin, float vMax, float lo1, float lo2, float la1, float la2) GenerateWindTexture(WindComponent uComponent, WindComponent vComponent)
        {
            ArgumentNullException.ThrowIfNull(uComponent);
            ArgumentNullException.ThrowIfNull(vComponent);

            WindVariables headerValues = uComponent.header;

            // retrieve all values
            int nx = headerValues.nx;
            int ny = headerValues.ny;
            var uValue = uComponent.data;
            var vValue = vComponent.data;
            double lo1 = headerValues.lo1;
            double la1 = headerValues.la1;
            double lo2 = headerValues.lo2;
            double la2 = headerValues.la2;

            // sanity checks
            double uMin = uValue.Min(), uMax = vValue.Max();
            double vMin = uValue.Min(), vMax = vValue.Max();
            var uRange = uMin - uMax;
            var vRange = vMin - vMax;

            Console.WriteLine($"nx={nx}, ny={ny}, uData.Length={uValue.Length}, vData.Length={vValue.Length}");
            Console.WriteLine($"uMin={uMin}, uMax={uMax}, vMin={vMin}, vMax={vMax}");
            Console.WriteLine($"Sample values: {string.Join(", ", uValue.Take(10))}");

            var pixels = new SKColor[nx * ny];


            for (var row = 0; row < ny; row++)
            {
                for (var col = 0; col < nx; col++)
                {   
                    var index = Convert.ToInt32(row * nx + col);
                    var actualU = uComponent.data[index];
                    var actualV = vComponent.data[index];

                    byte encodedU = uRange == 0 ? (byte)0 : (byte)(((actualU - uMin) / (uMax - uMin)) * 255);
                    byte encodedV = vRange == 0 ? (byte)0 : (byte)(((actualV - vMin) / (vMax - vMin)) * 255);

                    pixels[index] = new SKColor(encodedU, encodedV, 0, 255);
                    
                }
            }
            using var bitmap = new SKBitmap(nx, ny);
            bitmap.Pixels = pixels;

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            using var ms = new MemoryStream();
            data.SaveTo(ms);

            return (ms.ToArray(), (float)uMin, (float)uMax, (float)vMin, (float)vMax, (float)lo1, (float)lo2, (float)la1, (float)la2);
        }
    }
}