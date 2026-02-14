using Breeze.DTOs;
using Breeze.Extensions;
using Breeze.RequestHelpers;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Breeze.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController(IUnitOfWork unitOfWork, IPaymentService paymentService) :BaseApiController
    {
        [HttpGet("orders")]
        public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders([FromQuery]OrderSpecParams specParams)
        {
            var spec = new OrderSpecification(specParams);
            return await CreatePagedResult(unitOfWork.Repository<Order>(), spec, specParams.PageIndex, specParams.PageSize, o => o.ToDto());
        }
        [HttpGet("orders/{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var spec = new OrderSpecification(id);
            var order = await unitOfWork.Repository<Order>().GetEntityWithSpec(spec);
            if (order == null) return BadRequest("No order with that id");
            return order.ToDto();
        }
        [InvalidateCache("api/products|", "api/products/")]
        [HttpPost("orders/refund/{id:int}")]
        public async Task<ActionResult<OrderDto>> RefundOrder(int id)
        {
            var spec = new OrderSpecification(id);
            var order = await unitOfWork.Repository<Order>().GetEntityWithSpec(spec);
            if (order == null) return BadRequest("No order with that id");
            if (order.Status == OrderStatus.Pending)
                return BadRequest("Payment not received for this order");
            if(order.Status == OrderStatus.Accepted)
            {
                order.Status = OrderStatus.Refunded;
                foreach(var itemOrdered in order.OrderItems)
                {
                    var product = unitOfWork.Repository<Product>().GetByIdAsync(itemOrdered.ItemOrdered.ProductId).Result;
                    if (product == null) return BadRequest("Product in order not found");
                    product.QuantityInStock += itemOrdered.Quantity;
                    unitOfWork.Repository<Product>().Update(product);
                }
                await unitOfWork.Complete();
                return order.ToDto();
            }
            var result = await paymentService.RefundPayment(order.PaymentIntentId);

            if(result == "succeeded")
            {
                order.Status = OrderStatus.Refunded;
                foreach (var itemOrdered in order.OrderItems)
                {
                    var product = unitOfWork.Repository<Product>().GetByIdAsync(itemOrdered.ItemOrdered.ProductId).Result;
                    if (product == null) return BadRequest("Product in order not found");
                    product.QuantityInStock += itemOrdered.Quantity;
                    unitOfWork.Repository<Product>().Update(product);
                }
                await unitOfWork.Complete();
                return order.ToDto();
            }
            return BadRequest("Problem refunding order");
        }
    }
}
