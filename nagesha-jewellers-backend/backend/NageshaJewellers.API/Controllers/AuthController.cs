using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.DTOs;
using NageshaJewellers.API.Models;
using NageshaJewellers.API.Services;

namespace NageshaJewellers.API.Controllers
{
    // Base URL: /api/auth
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;
        private readonly EmailService _emailService;

        public AuthController(AppDbContext context, TokenService tokenService, EmailService emailService)
        {
            _context = context;
            _tokenService = tokenService;
            _emailService = emailService;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
                return BadRequest(new { message = "An account with this email already exists." });

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                // BCrypt scrambles the password into something unreadable.
                // This is the industry-standard way to store passwords safely.
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Customer"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send the "Welcome" email. We deliberately do this AFTER saving
            // the user, and we don't make the customer wait for the email to
            // finish sending before responding - "fire and forget" so
            // registration still feels instant even if email is slow.
            _ = _emailService.SendWelcomeEmailAsync(user.Email, user.FullName);

            var token = _tokenService.CreateToken(user);

            return Ok(new AuthResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            // We check "user == null" first, then check the password.
            // We give the SAME error message either way - this stops
            // attackers from guessing which emails are registered.
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            var token = _tokenService.CreateToken(user);

            return Ok(new AuthResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }
    }
}
