using WildFireTracker.fires;
using WildFireTracker.wind;
using WildFireTracker.aqi;
using WildFireTracker.cache;
using StackExchange.Redis;
using Microsoft.Extensions.DependencyInjection;
using WildFireTracker.search;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddControllers();

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, 
        policy =>
        {
            policy.WithOrigins("https://fire-tracker-dpjrs.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders(
                "X-Wind-UMin", "X-Wind-UMax", "X-Wind-VMin", "X-Wind-VMax",
                "X-Wind-Lo1", "X-Wind-La1", "X-Wind-Lo2", "X-Wind-La2"
            );
        });
});

builder.Services.AddDbContext<DatabaseContext>(options => options.UseNpgsql(builder.Configuration["SupabaseTransactionKey"]));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("RedisConnection");
    options.InstanceName = "WildfireTrackerCache";
});

// NASA FIRMS API
builder.Services.AddHttpClient("FIRMSClient", client =>
{
    client.BaseAddress = new Uri("https://firms.modaps.eosdis.nasa.gov/");
});
// Winds
builder.Services.AddHttpClient("WindClient", client =>
{
    client.BaseAddress = new Uri("http://localhost:7000");
});
// AQI
builder.Services.AddHttpClient("AqiClient", client =>
{
    client.BaseAddress = new Uri("https://tiles.aqicn.org");
});

builder.Services.AddScoped<ICSVService, CSVService>();
builder.Services.AddScoped<FireDetection>();
builder.Services.AddScoped<WindServices>();
builder.Services.AddScoped<WindVariables>();
builder.Services.AddScoped<AqiServices>();
builder.Services.AddScoped<FireServices>();
builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<WindComputationServices>();
builder.Services.AddHostedService<TimedBackgroundService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);

app.MapControllers();

app.Run();

