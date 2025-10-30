using Breeze.DTOs;
using Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Breeze.Controllers
{
    public class BuggyController : BaseApiController
    {
        [HttpGet("not-found")]
        public IActionResult GetNotFound()
        {
            return NotFound();
        }
        [HttpGet("bad-request")]
        public IActionResult GetBadRequest()
        {
            return BadRequest(new ProblemDetails { Title = "This is a bad request" });
        }
        [HttpGet("unauthorized")]
        public IActionResult GetUnauthorized()
        {
            return Unauthorized();
        }
        [HttpPost("validationerror")]
        public IActionResult GetValidationError(CreateProductDto product)
        {
            ModelState.AddModelError("Problem", "This is a validation error");
            return ValidationProblem();
        }
        [HttpGet("internalerror")]
        public IActionResult GetInternalError()
        {
            throw new Exception("This is a server error");
        }
        [Authorize]
        [HttpGet("secret")]
        public IActionResult GetSecret() 
        {
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Ok("Hello "+ name + " with the id of "+ id);
        }
    }
}
