using Microsoft.AspNetCore.Mvc;

namespace secure_cloud_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileController : ControllerBase
{
    [HttpGet]
    public string HalloWorld()
    {
        return "Hallo world";
    }
}