using Microsoft.AspNetCore.Mvc;
using secure_cloud_api.Core.Services.DTOs;
using secure_cloud_api.Core.Services.Interfaces;

namespace secure_cloud_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SharedFileController : ControllerBase
{
    private readonly ISharedFileService _sharedFileService;

    public SharedFileController(ISharedFileService sharedFileService)
    {
        _sharedFileService = sharedFileService;
    }

    /// <summary>
    /// Get all files shared with a specific user.
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetAllSharedFilesByUserId(string userId)
    {
        try
        {
            var sharedFiles = await _sharedFileService.GetAllSharedFilesByUserId(userId);
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
    public async Task<IActionResult> GetSharedUsersByFileId(Guid fileId)
    {
        try
        {
            var sharedUsers = await _sharedFileService.GetSharedUsersByFileId(fileId);
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
        try
        {
            var sharedFile = await _sharedFileService.ShareFile(dto);
            return CreatedAtAction(nameof(GetSharedUsersByFileId), new { fileId = sharedFile.FileId }, sharedFile);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Unshare a file from a specific user.
    /// </summary>
    [HttpDelete("{sharedFileId}")]
    public async Task<IActionResult> UnshareFile(Guid sharedFileId)
    {
        try
        {
            var unsharedFile = await _sharedFileService.UnshareFile(sharedFileId);
            return Ok(unsharedFile);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
