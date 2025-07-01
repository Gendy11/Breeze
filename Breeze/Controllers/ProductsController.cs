using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Core.Specifications;
using Breeze.RequestHelpers;

namespace Breeze.Controllers
{
    public class ProductsController : BaseApiController
    {
        private readonly IGenericRepository<Product> _repo;

        public ProductsController(IGenericRepository<Product> repo)
        {
            this._repo =repo;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery]ProductSpecParams specParams)
        {
            var spec= new ProductSpecification(specParams);
            return await CreatePagedResult(_repo,spec , specParams.PageIndex, specParams.PageSize);
        }   

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product=await _repo.GetByIdAsync(id);

            return Ok(product);
        }

        [HttpGet("brands")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetProductBrands()
        {
            var spec=new BrandListSpecification();
            return Ok(await _repo.ListAsync(spec));
        }

        [HttpGet("types")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetProductTypes()
        {
            var spec = new TypeListSpecification();
            return Ok(await _repo.ListAsync(spec));
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            _repo.Add(product);
            if(await _repo.SaveAllAsync())  
            {
                return CreatedAtAction("GetProduct", new { id = product.Id }, product);
            }
            return BadRequest("Problem creating product");
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> UpdateProduct(int id, Product product)
        {
            if (!productExists(id) || product.Id!=id) 
                return BadRequest("Cannot update product");

            _repo.Update(product);

            if (await _repo.SaveAllAsync())
            {
                return Ok();
            }
            return BadRequest("Problem updating product");
        }

        [HttpDelete("{id}")]

        public async Task<ActionResult> DeleteProduct(Product product)
        {
            if (!productExists(product.Id))
                return BadRequest("Cannot delete product");
            await _repo.GetByIdAsync(product.Id);
            _repo.Remove(product);
            if (await _repo.SaveAllAsync())
            {
                return Ok();
            }
            return BadRequest("Problem deleting product");
        }
        private bool productExists(int id)
        {
           return _repo.Exists(id);
        }
    }
}
