using Microsoft.AspNetCore.Mvc;
using secure_cloud_api.Core.Services.Interfaces;

namespace secure_cloud_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileController : ControllerBase
{
    private readonly IFileService _fileService;

    public FileController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpGet]
    public string HalloWorld()
    {
        return "Hallo world";
    }
    
    [HttpPost]
    [Route("rebuild")]
    public async Task<IActionResult> RebuildDatabase()
    {
        try
        {
            await _fileService.RebuildDatabase();
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }
    }
}