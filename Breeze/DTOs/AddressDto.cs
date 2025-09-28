using System.ComponentModel.DataAnnotations;

namespace Breeze.DTOs
{
    public class AddressDto
    {
        [Required]
        public string Line1 { get; set; } = String.Empty;
        public string? Line2 { get; set; }
        [Required]
        public string City { get; set; } = String.Empty;
        [Required]
        public string State { get; set; } = String.Empty;
        [Required]
        public string PostalCode { get; set; } = String.Empty;
        [Required]
        public string Country { get; set; } = String.Empty;
    }
}
