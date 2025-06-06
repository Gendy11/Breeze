using Core.Entities;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class ProductRepository : IProductRepository
    {
        private readonly StoreContext _context;
        public ProductRepository(StoreContext storeContext) 
        {
            this._context=storeContext; 
        }
        public void AddProduct(Product product)
        {
            _context.Add(product);  
        }

        public void DeleteProduct(Product product)
        {
            _context.Remove(product);
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products.FindAsync(id);

        }

        public async Task<IReadOnlyList<Product>> GetProductsAsync(string? brand,string? type,string? sort)
        {

            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(brand))
            {
                query=query.Where(p => p.Brand == brand);
                }
            if (!string.IsNullOrWhiteSpace(type))
            {
                query=query.Where(p => p.Type == type);
            }
            if(sort=="priceAsc")
                query = query.OrderBy(p => p.Price);

            if (sort == "priceDesc")
                query = query.OrderByDescending(p => p.Price);

            else
            {
                query=query.OrderBy(p => p.Name);
            }
            return await query.ToListAsync();
        }

        public async Task<IReadOnlyList<string>> GetBrandsAsync()
        {
            return await _context.Products.Select(p => p.Brand).Distinct().ToListAsync();   
        }

        public async Task<IReadOnlyList<string>> GetTypesAsync()
        {
            return await _context.Products.Select(p => p.Type).Distinct().ToListAsync();
        }

        public bool ProductExists(int id)
        {
            return _context.Products.Any(p => p.Id == id);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void UpdateProduct(Product product)
        {
           _context.Entry(product).State = EntityState.Modified;
        }
    }
}
