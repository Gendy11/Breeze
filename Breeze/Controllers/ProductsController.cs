using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Breeze.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly StoreContext _context;

        public ProductsController(StoreContext storeContext)
        {
            _context = storeContext;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product=await _context.Products.FindAsync(id);

            if (product == null) return NotFound();

            return product;
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
           await _context.AddAsync(product);
           await _context.SaveChangesAsync();
           return product;
        }

        [HttpPut("{id:int}")]

        public async Task<ActionResult> UpdateProduct(int id,Product product)
        {
            if(!productExists(id)) 
                return BadRequest("Cannot update product");

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]

        public async Task<ActionResult> DeleteProduct(int id)
        {
            if (!productExists(id))
                return BadRequest("Cannot update product");
            var product = await _context.Products.FindAsync(id);
            _context.Remove(product);
            await _context.SaveChangesAsync();
            return Ok();

        }
        private bool productExists(int id)
        {
            return _context.Products.Any(x => x.Id == id);
        }
    }
}
