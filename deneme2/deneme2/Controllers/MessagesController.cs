using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using deneme2.Interfaces;
using deneme2.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using deneme2.Repositories;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace deneme2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IHubContext<deneme2.Hubs.ChatHub> _hubContext;
        private readonly IUserRepository _userRepository;

        public MessagesController(IMessageRepository messageRepository, IHubContext<deneme2.Hubs.ChatHub> hubContext, IUserRepository userRepository)
        {
            _messageRepository = messageRepository;
            _hubContext = hubContext;
            _userRepository = userRepository;
        }

        // GET: api/Messages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages()
        {
            var messages = await _messageRepository.GetAllMessagesAsync();
            return Ok(messages);
        }

        // GET: api/Messages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Message>> GetMessage(int id)
        {
            var message = await _messageRepository.GetMessageByIdAsync(id);

            if (message == null)
            {
                return NotFound();
            }

            return Ok(message);
        }

        // Güncelleme
        // PUT: api/Messages/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMessage(int id, Message message)
        {
            // mesajı ID üzerinden al
            var existingMessage = await _messageRepository.GetMessageByIdAsync(id);

            // mesaj bulunamazsa 404 döner
            if (existingMessage == null)
            {
                return NotFound();
            }

            // Gelen kullanıcı bilgilerini mevcut kullanıcıyla güncelle
            existingMessage.senderId = message.senderId != 0 ? message.senderId : existingMessage.senderId;
            existingMessage.receiverId = message.receiverId != 0 ? message.receiverId : existingMessage.receiverId;
            existingMessage.content = message.content ?? existingMessage.content;

            await _messageRepository.UpdateMessageAsync(existingMessage);
            return NoContent();
        }

        // POST: api/Messages
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Message>> PostMessage(Message message)
        {
            await _messageRepository.AddMessageAsync(message);

            return CreatedAtAction(nameof(GetMessage), new { id = message.id }, message);
        }

        // DELETE: api/Messages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            if (!await _messageRepository.MessageExistsAsync(id))
            {
                return NotFound();
            }

            await _messageRepository.DeleteMessageAsync(id);
            return NoContent();
        }
        
        [HttpPost("send")]
        [Authorize]
        public async Task<IActionResult> SendMessage(int receiverId, string message)
        {
            var claimsIdentity = HttpContext.User.Identity as ClaimsIdentity;
            var idClaim = claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null)
            {
                return Unauthorized("User is not authenticated.");
            }

            // Kullanıcı adı veya diğer kimlik bilgilerini claim'den al
            string username = claimsIdentity?.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(username))
            {
                return BadRequest("Username is not available.");
            }

            int senderId = await _userRepository.GetUserIdByUsernameAsync(username);

            var messageEntity = new Message
            {
                senderId = senderId,
                receiverId = receiverId,
                content = message
            };

            await _messageRepository.SaveMessageAsync(messageEntity);

            return Ok();
        }
        
    }
}