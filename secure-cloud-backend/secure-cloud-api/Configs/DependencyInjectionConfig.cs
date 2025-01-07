using secure_cloud_api.Core.Helpers;
using secure_cloud_api.Core.Repositories;
using secure_cloud_api.Core.Repositories.Interfaces;
using secure_cloud_api.Core.Services;
using secure_cloud_api.Core.Services.Interfaces;

namespace secure_cloud_api.Configs;

public static class DependencyInjectionConfig
{
    public static void ConfigureDependencyInjection(this IServiceCollection services, WebApplicationBuilder builder)
    {
        // DB
        services.AddDbContext<DatabaseContext>();

        // Dependency Injection
        services.AddScoped<IFileRepository, FileRepository>();
        services.AddScoped<IFileService, FileService>();

        services.AddScoped<IFileShareRepository, FileShareRepository>();
        services.AddScoped<IFileShareService, FileShareService>();

        // AutoMapper
        services.AddSingleton(AutoMapperConfig.ConfigureAutoMapper());
    }

}