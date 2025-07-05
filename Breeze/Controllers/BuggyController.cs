using Breeze.DTOs;
using Core.Entities;
using Microsoft.AspNetCore.Mvc;

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
        [HttpGet("inernalerror")]
        public IActionResult GetInternalError()
        {
            throw new Exception("This is a server error");
        }
    }
}
