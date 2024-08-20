using deneme2.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace deneme2.Interfaces
{
    public interface IMessageRepository
    {
        Task<IEnumerable<Message>> GetAllMessagesAsync();
        Task<Message> GetMessageByIdAsync(int id);
        Task AddMessageAsync(Message message);
        Task UpdateMessageAsync(Message message);
        Task DeleteMessageAsync(int id);
        Task<bool> MessageExistsAsync(int id);
        Task SaveMessageAsync(Message message);
    }
}
