using secure_cloud_api.Configs;
using secure_cloud_api.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ConfigureDependencyInjection(builder);

var app = builder.Build();

app.UseCors(static x => x
    .AllowAnyHeader()
    .AllowAnyOrigin()
    .AllowAnyMethod()
);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Check if token is valid
app.UseMiddleware<KeycloakTokenValidationMiddleware>();

app.MapControllers();

app.Run();
