using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using File = secure_cloud_api.Core.Entities.File;
using secure_cloud_api.Core.Entities;

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

        // Auto generate id
        modelBuilder.Entity<File>().Property(f => f.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<SharedFile>().Property(sf => sf.Id).ValueGeneratedOnAdd();

        // Key has to be unique
        modelBuilder.Entity<File>().HasIndex(f => f.Key).IsUnique();

        // Setup relationship
        modelBuilder.Entity<SharedFile>()
            .HasOne(sf => sf.File)
            .WithMany(f => f.SharedWith)
            .HasForeignKey(sf => sf.FileId);

        #endregion
    }

    public DbSet<File> Files { get; set; }
    public DbSet<SharedFile> SharedFiles { get; set; }
}
