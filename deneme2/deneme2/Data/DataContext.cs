using deneme2.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace deneme2.Data
{
    // veritabanı ile uygulama kodu arasında bir köprü görevi görür
    public class DataContext:DbContext
    {
        public DataContext(DbContextOptions<DataContext> options)
            :base(options)
        {
        }

        public DbSet<AppUser> AppUser { get; set; } = null!;
        public DbSet<Message> Message { get; set; } = null!;
    }
}
