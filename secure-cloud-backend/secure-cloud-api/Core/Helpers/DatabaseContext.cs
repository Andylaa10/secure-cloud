using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using File = secure_cloud_api.Core.Entities.File;


namespace secure_cloud_api.Core.Helpers;

public class DatabaseContext : DbContext
{
    public DatabaseContext()
    {
        Env.Load();
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        Console.WriteLine(Env.GetString("CONNECTION_STRING"));
        optionsBuilder.UseNpgsql(Env.GetString("CONNECTION_STRING"));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        #region Setup DB

        //Auto generate id
        modelBuilder.Entity<File>().Property(f => f.Id).ValueGeneratedOnAdd();
        //Key has to be unique
        modelBuilder.Entity<File>().HasIndex(f => f.Key).IsUnique();

        #endregion
    }
    
    public DbSet<File> Files { get; set; }
 }