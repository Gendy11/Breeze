using System.ComponentModel.DataAnnotations;

namespace Breeze.DTOs
{
    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Description { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Price cannot be less than zero.")]
        public decimal Price { get; set; }
        [Required]
        public string PictureUrl { get; set; } = string.Empty;
        [Required]
        public string Type { get; set; } = string.Empty;
        [Required]
        public string Brand { get; set; } = string.Empty;
        [Range(0, int.MaxValue, ErrorMessage = "Quantity in stock must be at least 0.")]
        public int QuantityInStock { get; set; }
    }
}
