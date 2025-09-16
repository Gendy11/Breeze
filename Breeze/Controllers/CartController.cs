using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Breeze.Controllers
{
    public class CartController:BaseApiController
    {
        private readonly ICartService _cartService;
        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }
        [HttpGet]
        public async Task<ActionResult<ShoppingCart>> GetCartById(string id)
        {
            var cart = await _cartService.GetCartAsync(id);
            return Ok(cart ?? new ShoppingCart { Id = id});
        }
        [HttpPost] 
        public async Task<ActionResult<ShoppingCart>> UpdateCart(ShoppingCart cart)
        {
            var updatedCart = await _cartService.SetCartAsync(cart);
            if(updatedCart == null) return BadRequest("Problem updating the cart");
            return updatedCart;
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteCart(string id)
        {
            var deleted = await _cartService.DeleteCartAsync(id);
            if (deleted) return Ok();
            return BadRequest("Problem deleting the cart");
        }
    }
}
