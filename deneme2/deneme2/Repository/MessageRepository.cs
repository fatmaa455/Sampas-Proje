using deneme2.Data;
using deneme2.Interfaces;
using deneme2.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace deneme2.Repository
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;

        public MessageRepository(DataContext context)
        {
            _context = context;
        }

        public async Task AddMessageAsync(Message message)
        {
            _context.Message.Add(message);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteMessageAsync(int id)
        {
            var message = await _context.Message.FindAsync(id);
            if (message != null)
            {
                _context.Message.Remove(message);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Message>> GetAllMessagesAsync()
        {
            return await _context.Message.ToListAsync();
        }

        public async Task<Message> GetMessageByIdAsync(int id)
        {
            return await _context.Message.FindAsync(id);
        }

        public async Task<bool> MessageExistsAsync(int id)
        {
            return await _context.Message.AnyAsync(e => e.id == id);
        }

        public async Task SaveMessageAsync(Message message)
        {
            _context.Message.Add(message);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateMessageAsync(Message message)
        {
            _context.Entry(message).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}
