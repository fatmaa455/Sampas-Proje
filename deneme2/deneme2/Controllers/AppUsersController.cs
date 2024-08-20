using Microsoft.AspNetCore.Mvc;
using deneme2.Interfaces;
using deneme2.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using deneme2.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace deneme2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppUsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<AppUser> _passwordHasher;
        private readonly IHubContext<ChatHub> _hubContext;

        public AppUsersController(IUserRepository userRepository, IPasswordHasher<AppUser> passwordHasher, IHubContext<ChatHub> hubContext)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _hubContext = hubContext;
        }

        // GET: api/AppUsers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetAppUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(users);
        }

        // GET: api/AppUsers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AppUser>> GetAppUser(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // Güncelleme
        // PUT: api/AppUsers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAppUser(int id, AppUser appUser)
        {
            // Kullanıcıyı ID üzerinden al
            var existingUser = await _userRepository.GetUserByIdAsync(id);

            // Kullanıcı bulunamazsa 404 döner
            if (existingUser == null)
            {
                return NotFound();
            }

            // Gelen kullanıcı bilgilerini mevcut kullanıcıyla güncelle
            existingUser.name = appUser.name ?? existingUser.name;
            existingUser.surname = appUser.surname ?? existingUser.surname;
            existingUser.username = appUser.username ?? existingUser.username;
            existingUser.email = appUser.email ?? existingUser.email;
            existingUser.roleId = appUser.roleId != 0 ? appUser.roleId : existingUser.roleId;

            // Şifre güncellenmişse hash'le
            if (!string.IsNullOrEmpty(appUser.password))
            {
                existingUser.password = _passwordHasher.HashPassword(existingUser, appUser.password);
            }

            // Güncellemeyi gerçekleştir
            await _userRepository.UpdateUserAsync(existingUser);

            return Ok(existingUser);
        }

        // POST: api/AppUsers
        [HttpPost]
        public async Task<ActionResult<AppUser>> PostAppUser(AppUser appUser)
        {
            appUser.password = _passwordHasher.HashPassword(appUser, appUser.password);
            await _userRepository.AddUserAsync(appUser);
            return CreatedAtAction(nameof(GetAppUser), new { id = appUser.id }, appUser);
        }

        // DELETE: api/AppUsers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppUser(int id)
        {
            if (!await _userRepository.UserExistsAsync(id))
            {
                return NotFound();
            }

            await _userRepository.DeleteUserAsync(id);
            return NoContent();
        }
    }
}
