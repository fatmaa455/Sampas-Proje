using deneme2.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace deneme2.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<AppUser>> GetAllUsersAsync();
        Task<AppUser> GetUserByIdAsync(int id);
        Task AddUserAsync(AppUser user);
        Task UpdateUserAsync(AppUser user);
        Task DeleteUserAsync(int id);
        Task<bool> UserExistsAsync(int id);
        Task<AppUser> GetUserByUsernameAndPasswordAsync(string username, string password);
        Task<int> GetUserIdByUsernameAsync(string username);
    }
}
