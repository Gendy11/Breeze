using Breeze.DTOs;
using Core.Entities;
using Core.Entities.OrderAggregate;

namespace Breeze.Extensions
{
    public static class ProductMappingExtensions
    {
        public static Product toEntity(this CreateProductDto productDto)
        {
            if (productDto == null) throw new ArgumentNullException(nameof(productDto));

            return new Product
            {
                Name = productDto.Name,
                Brand = productDto.Brand,
                Description = productDto.Description,
                PictureUrl = productDto.PictureUrl,
                Type = productDto.Type,
                Price = productDto.Price,
                QuantityInStock = productDto.QuantityInStock,
            };

        }
    }
}
