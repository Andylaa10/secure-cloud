using Microsoft.AspNetCore.Mvc;
using secure_cloud_api.Core.Services.DTOs;
using secure_cloud_api.Core.Services.Interfaces;

namespace secure_cloud_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileShareController : ControllerBase
{
    private readonly IFileShareService _fileShareService;

    public FileShareController(IFileShareService fileShareService)
    {
        _fileShareService = fileShareService;
    }

    /// <summary>
    /// Get all files shared with a specific user.
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetAllSharedFilesByUserId([FromRoute] string userId)
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }

        try
        {
            var sharedFiles = await _fileShareService.GetAllSharedFilesByUserId(userId);
            return Ok(sharedFiles);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Get all users a file is shared with.
    /// </summary>
    [HttpGet("file/{fileId}/users")]
    public async Task<IActionResult> GetUsersOnSharedFile([FromRoute] string fileId)
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }

        try
        {
            var sharedUsers = await _fileShareService.GetUsersOnSharedFile(Guid.Parse(fileId));
            return Ok(sharedUsers);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Share a file with a user.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> ShareFile([FromBody] CreateSharedFileDto dto)
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }

        try
        {
            await _fileShareService.ShareFile(dto);
            return StatusCode(201, "Successfully shared");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Unshare a file from a specific user.
    /// </summary>
    [HttpDelete("{sharedWithUserId}/{sharedFileId}")]
    public async Task<IActionResult> RemoveUserFromFile([FromRoute] string sharedWithUserId, [FromRoute] string sharedFileId)
    {
        var tokenIsValid = HttpContext.Items["TokenIsValid"] as bool? ?? false;

        if (!tokenIsValid)
        {
            return Unauthorized("Token is invalid or expired.");
        }

        try
        {
            await _fileShareService.RemoveUserFromFile(Guid.Parse(sharedWithUserId), Guid.Parse(sharedFileId));
            return Ok("Successfully remove user");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
