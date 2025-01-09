using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using FileShare = secure_cloud_api.Core.Entities.FileShare;

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
        modelBuilder.Entity<FileShare>().Property(sf => sf.Id).ValueGeneratedOnAdd();

        modelBuilder.Entity<FileShare>()
            .HasOne(sf => sf.File)
            .WithMany(f => f.SharedWith)
            .HasForeignKey(sf => sf.FileId).OnDelete(DeleteBehavior.Cascade);
        #endregion
    }

    public DbSet<File> Files { get; set; }
    public DbSet<FileShare> SharedFiles { get; set; }
}
