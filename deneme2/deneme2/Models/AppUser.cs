namespace deneme2.Models
{
    public class AppUser
    {
        public int id { get; set; }
        public string name { get; set; }
        public string surname { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public int roleId { get; set; }
    }
}
