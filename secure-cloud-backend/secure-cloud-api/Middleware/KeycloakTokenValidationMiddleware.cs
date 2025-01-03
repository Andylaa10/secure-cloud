using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using secure_cloud_api.Core.Entities.Helpers;

namespace secure_cloud_api.Middleware;

public class KeycloakTokenValidationMiddleware
{
    private readonly RequestDelegate _next;
    private HttpClient _httpClient = new();


    public KeycloakTokenValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            var authorizationHeader = context.Request.Headers["Authorization"].ToString();

            if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("Authorization header is missing or invalid.");
                return;
            }

            var token = authorizationHeader.Substring("Bearer ".Length).Trim();

            var securityKey = await GetKeycloakSigningKey(context);

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = "http://localhost:8080/realms/master",
                ValidAudiences = new List<string> { "account", "master-realm" },
                IssuerSigningKey = securityKey,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var principal = await tokenHandler.ValidateTokenAsync(token, validationParameters);
                context.Items["TokenIsValid"] = principal.IsValid;
            }
            catch (SecurityTokenException)
            {
                context.Items["TokenIsValid"] = false;
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Invalid token.");
                return;
            }
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync($"An unexpected error occurred: {ex.Message}");
            return;
        }

        await _next(context);
    }

    private async Task<RsaSecurityKey> GetKeycloakSigningKey(HttpContext context)
    {
        // Get the Keycloak public key for validation
        var requestUri = "http://keycloak:8080/realms/master/protocol/openid-connect/certs";
        var response = await _httpClient.GetAsync(requestUri);
        
        if (!response.IsSuccessStatusCode)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync($"Error fetching Keycloak certificates: {response.ReasonPhrase}");
            return null;
        }

        var content = await response.Content.ReadFromJsonAsync<KeycloakCertResponse>();
        var signingKey = content?.Keys?.FirstOrDefault(key => key.Use == "sig");

        if (signingKey == null)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("No valid signing key found.");
            return null;
        }

        var certData = signingKey.X5c[0];
        var pem = $"-----BEGIN CERTIFICATE-----\n{certData}\n-----END CERTIFICATE-----";
        var certificate = new X509Certificate2(Encoding.ASCII.GetBytes(pem));
        var rsa = certificate.GetRSAPublicKey();
        var securityKey = new RsaSecurityKey(rsa);

        return securityKey;
    }
}