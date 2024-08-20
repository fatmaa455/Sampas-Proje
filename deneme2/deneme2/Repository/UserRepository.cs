using deneme2.Data;
using deneme2.Interfaces;
using deneme2.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace deneme2.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        private readonly IPasswordHasher<AppUser> _passwordHasher;

        public UserRepository(DataContext context, IPasswordHasher<AppUser> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<IEnumerable<AppUser>> GetAllUsersAsync()
        {
            return await _context.AppUser.ToListAsync();
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await _context.AppUser.FindAsync(id);
        }

        public async Task AddUserAsync(AppUser user)
        {
            _context.AppUser.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateUserAsync(AppUser user)
        {
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _context.AppUser.FindAsync(id);
            if (user != null)
            {
                _context.AppUser.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> UserExistsAsync(int id)
        {
            return await _context.AppUser.AnyAsync(e => e.id == id);
        }

        public async Task<AppUser> GetUserByUsernameAndPasswordAsync(string username, string password)
        {
            var user = await _context.AppUser.FirstOrDefaultAsync(u => u.username == username);

            if (user != null && _passwordHasher.VerifyHashedPassword(user, user.password, password) == PasswordVerificationResult.Success)
            {
                return user;
            }

            return null;
        }

        public async Task<int> GetUserIdByUsernameAsync(string username)
        {
            var user = await _context.AppUser.SingleOrDefaultAsync(u => u.username == username);
            if (user == null)
            {
                throw new Exception($"User with username '{username}' not found");
            }
            return user.id;
        }
    }
}
