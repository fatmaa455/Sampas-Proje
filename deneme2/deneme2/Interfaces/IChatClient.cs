using deneme2.Models;

namespace deneme2.Interfaces
{
    public interface IChatClient
    {
        Task ReceiveMessage(int senderId, int receiverId, string message);
        Task ReceiveUserUpdate(AppUser user);
        Task ReceiveUserAdd(AppUser user);
        Task ReceiveUserDelete(int id);
    }
}
