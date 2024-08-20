using Microsoft.AspNetCore.Mvc;
using deneme2.Interfaces;
using deneme2.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;

namespace deneme2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly string _key = "vJ7w-<h!dW*}Fy^)Oe3@Kr&+Lm%hTg2$eE2"; // Gizli anahtarınızı buraya girin

        public AuthController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AppUser model)
        {
            var user = await _userRepository.GetUserByUsernameAndPasswordAsync(model.username, model.password);
            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }
            var passwordHasher = new PasswordHasher<AppUser>();
            var result = passwordHasher.VerifyHashedPassword(user, user.password, model.password);

            if (result != PasswordVerificationResult.Success)
            {
                return Unauthorized("Invalid credentials.");
            }

            // Kullanıcı doğrulama işlemi yapılmalı
            //if (model.username == user.username && model.password == model.password) // Basit bir doğrulama örneği
            //{
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_key);

                // Claims tanımlamaları
                var claims = new[]
                {// Kullanıcı ID'sini ekleyebilirsiniz
                    new Claim(ClaimTypes.NameIdentifier, user.id.ToString()), // Kullanıcı ID'si
                    new Claim(ClaimTypes.Name, user.username)
                };

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);


                return Ok(new { Token = tokenString });
            //}

            //return Ok();
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Token'ı geçersiz kılma veya çerezi temizleme işlemleri yapılacak.

            return Ok("Logout successful");
        }
    }
}
