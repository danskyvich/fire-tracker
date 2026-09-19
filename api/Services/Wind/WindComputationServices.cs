using System;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace WildFireTracker.wind
{
    // describe the final result
    public readonly struct WindPoint
    {
        public readonly float Lat, Lon, Speed, Direction;
        public WindPoint(float lat, float lon, float speed, float direction)
        => (Lat, Lon, Speed, Direction) = (lat, lon, speed, direction);
    }

    // actual computational logic
    public class WindComputationServices
    {
        public byte[] GenerateWindTexture(WindComponent uComponent, WindComponent vComponent)
        {
            ArgumentNullException.ThrowIfNull(uComponent);
            ArgumentNullException.ThrowIfNull(vComponent);

            WindVariables headerValues = uComponent.header;
            int nx = headerValues.nx;
            int ny = headerValues.ny;
            var uValue = uComponent.data;
            var vValue = vComponent.data;
            double uMin = uValue.Min(), uMax = vValue.Min();
            double vMin = uValue.Max(), vMax = vValue.Max();
            
            using var image = new Image<Rgba32>(nx, ny);

            for (var row = 0; row < ny; row++)
            {
                for (var col = 0; col < nx; col++)
                {   
                    var index = Convert.ToInt32(row * nx + col);
                    var actualU = uComponent.data[index];
                    var actualV = vComponent.data[index];

                    var uRange = uMin - uMax;
                    var vRange = vMin - vMax;
                    byte encodedU = uRange == 0 ? (byte)0 : (byte)(((actualU - uMin) / (uMax - uMin)) * 255);
                    byte encodedV = vRange == 0 ? (byte)0 : (byte)(((actualV - vMin) / (vMax - vMin)) * 255);

                    image[col, row] = new Rgba32(encodedU, encodedV, 0, 255);
                    
                }
            }
            using var ms = new MemoryStream();
            image.SaveAsPng(ms);
            return ms.ToArray();
        }
    }
}