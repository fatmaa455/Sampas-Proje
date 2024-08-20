using deneme2.Interfaces;
using deneme2.Models;
using Microsoft.AspNetCore.SignalR;

namespace deneme2.Hubs
{
    public sealed class ChatHub : Hub<IChatClient>
    {
        private readonly IUserRepository _userRepository;
        private readonly IMessageRepository _messageRepository;

        public ChatHub(IUserRepository userRepository, IMessageRepository messageRepository)
        {
            _userRepository = userRepository;
            _messageRepository = messageRepository;
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();

            if (!string.IsNullOrEmpty(username))
            {
                int userId = await _userRepository.GetUserIdByUsernameAsync(username);
                await Groups.AddToGroupAsync(Context.ConnectionId, userId.ToString());

                Console.WriteLine($"User connected: {username} with user ID: {userId}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();

            if (!string.IsNullOrEmpty(username))
            {
                int userId = await _userRepository.GetUserIdByUsernameAsync(username);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.ToString());

                Console.WriteLine($"User disconnected: {username} with user ID: {userId}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Mesaj gönderme işlemi
        public async Task SendMessage(int receiverId, string message)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();

            if (string.IsNullOrEmpty(username))
            {
                Console.WriteLine("Kullanıcı kimliği doğrulanamadı.");
                return;
            }

            Console.WriteLine("SendMessage çağrıldı: receiverId: {0}, message: {1}", receiverId, message);

            int senderId = await _userRepository.GetUserIdByUsernameAsync(username);

            var messageEntity = new Message
            {
                senderId = senderId,
                receiverId = receiverId,
                content = message
            };

            Console.WriteLine("Mesaj kaydediliyor: {0}", messageEntity);

            await _messageRepository.SaveMessageAsync(messageEntity);

            Console.WriteLine("Mesaj başarıyla kaydedildi.");

            // Mesajı belirli bir gruba (alıcıya) ilet
            await Clients.Group(receiverId.ToString()).ReceiveMessage(senderId, receiverId, message);
        }

        // Güncelleme işlemi
        public async Task UpdateUser(AppUser user)
        {
            await Clients.All.ReceiveUserUpdate(user); // Burada ReceiveUserUpdate metodu çağrılır
        }

        // Ekleme işlemi
        public async Task AddUser(AppUser user)
        {
            await Clients.All.ReceiveUserAdd(user);
        }

        // Silme işlemi
        public async Task DeleteUser(int id)
        {
            await Clients.All.ReceiveUserDelete(id);
        }
    }
}

