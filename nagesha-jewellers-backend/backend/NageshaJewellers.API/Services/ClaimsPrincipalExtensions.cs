using System.Security.Claims;

namespace NageshaJewellers.API.Services
{
    // A small helper so every controller doesn't repeat this same logic.
    // When someone is logged in, their token contains their UserId. This
    // pulls that UserId back out so we know "who is asking".
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(idClaim!);
        }
    }
}
