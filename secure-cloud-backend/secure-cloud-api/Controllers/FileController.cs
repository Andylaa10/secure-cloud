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
    [Route("Files")]
    public async Task<IActionResult> GetAllFiles()
    {
        try
        {
            return Ok(await _fileService.GetAllFiles());
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }
    }
    
    [HttpGet]
    [Route("Files/{id}")]
    public async Task<IActionResult> GetFileById(Guid id)
    {
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
    [Route("Upload")]
    public async Task<IActionResult> AddFile([FromBody] CreateFileDto dto)
    {
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
    [Route("Delete/{id}")]
    public async Task<IActionResult> DeleteFile([FromRoute] string id)
    {
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
        try
        {
            await _fileService.RebuildDatabase();
            return Ok(new {message = "Database has been rebuilt."});
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }
    }
}