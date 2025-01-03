using Microsoft.AspNetCore.Mvc;
using secure_cloud_api.Core.Services.DTOs;
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
    [Route("getByOwnerId/{ownerId}")]
    public async Task<IActionResult> GetAllFilesByOwnerId([FromRoute] Guid ownerId)
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }
        
        try
        {
            return Ok(await _fileService.GetAllFilesByOwnerId(ownerId));
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }
    }

    [HttpGet]
    [Route("getFile/{id}")]
    public async Task<IActionResult> GetFileById([FromRoute] Guid id)
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }
        
        try
        {
            var file = await _fileService.GetFileById(id);

            if (file == null)
            {
                return NotFound($"File with ID {id} not found.");
            }

            return Ok(file);
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }
    }


    [HttpPost]
    [Route("uploadFile")]
    public async Task<IActionResult> AddFile([FromBody] CreateFileDto dto)
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }
        
        try
        {
            var result = await _fileService.AddFile(dto);
            return Ok(new { message = $"File was uploaded successfully", result });
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }
    }

    [HttpDelete]
    [Route("deleteFile/{id}")]
    public async Task<IActionResult> DeleteFile([FromRoute] string id)
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }
        
        try
        {
            var parsedGuid = Guid.Parse(id);
            var result = await _fileService.DeleteFile(parsedGuid);
            return Ok(new { message = $"File was deleted successfully", result });
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }
    }

    [HttpPost]
    [Route("rebuild")]
    public async Task<IActionResult> RebuildDatabase()
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }
        
        try
        {
            await _fileService.RebuildDatabase();
            return Ok(new { message = "Database has been rebuilt." });
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }
    }
}