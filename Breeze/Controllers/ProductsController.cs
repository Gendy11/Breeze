using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Core.Specifications;
using Breeze.RequestHelpers;

namespace Breeze.Controllers
{
    public class ProductsController(IUnitOfWork unitOfWork) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery]ProductSpecParams specParams)
        {
            var spec= new ProductSpecification(specParams);
            return await CreatePagedResult(unitOfWork.Repository<Product>(),spec , specParams.PageIndex, specParams.PageSize);
        }   

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product=await unitOfWork.Repository<Product>().GetByIdAsync(id);

            return Ok(product);
        }

        [HttpGet("brands")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetProductBrands()
        {
            var spec=new BrandListSpecification();
            return Ok(await unitOfWork.Repository<Product>().ListAsync(spec));
        }

        [HttpGet("types")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetProductTypes()
        {
            var spec = new TypeListSpecification();
            return Ok(await unitOfWork.Repository<Product>().ListAsync(spec));
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            unitOfWork.Repository<Product>().Add(product);
            if(await unitOfWork.Complete())  
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

            unitOfWork.Repository<Product>().Update(product);

            if (await unitOfWork.Complete())
            {
                return Ok();
            }
            return BadRequest("Problem updating product");
        }

        [HttpDelete("{id}")]

        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await unitOfWork.Repository<Product>().GetByIdAsync(id);
            if (product == null) return NotFound();
            unitOfWork.Repository<Product>().Remove(product);
            if (await unitOfWork.Complete())
            {
                return Ok();
            }
            return BadRequest("Problem deleting product");
        }
        private bool productExists(int id)
        {
           return unitOfWork.Repository<Product>().Exists(id);
        }
    }
}
