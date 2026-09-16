using WildFireTracker.fires;
using WildFireTracker.wind;

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
            policy.WithOrigins("http://localhost:3000");
            policy.AllowAnyHeader();
            policy.AllowAnyMethod();
        });
});

// NASA FIRMS API
builder.Services.AddHttpClient("FIRMSClient", client =>
{
    client.BaseAddress = new Uri("https://firms.modaps.eosdis.nasa.gov/");
});
builder.Services.AddHttpClient("WindClient", client =>
{
    client.BaseAddress = new Uri("http://localhost:7000");
});

builder.Services.AddScoped<ICSVService, CSVService>();
builder.Services.AddScoped<FirmsService>();
builder.Services.AddScoped<FireDetection>();
builder.Services.AddScoped<WindServices>();
builder.Services.AddScoped<WindVariables>();

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

