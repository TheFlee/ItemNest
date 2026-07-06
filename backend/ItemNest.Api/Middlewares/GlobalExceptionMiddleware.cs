using FluentValidation;
using ItemNest.Application.Exceptions;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ItemNest.Api.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        _logger.LogError(ex, "Unhandled exception while processing request.");

        context.Response.ContentType = "application/problem+json";

        var (statusCode, problemDetails) = ex switch
        {
            ValidationException validationException =>
                (StatusCodes.Status400BadRequest,
                 CreateValidationProblemDetails(context, validationException)),

            KeyNotFoundException =>
                (StatusCodes.Status404NotFound,
                 CreateProblemDetails(
                     context,
                     StatusCodes.Status404NotFound,
                     "Resource not found",
                     ex.Message)),

            ArgumentException =>
                (StatusCodes.Status400BadRequest,
                 CreateProblemDetails(
                     context,
                     StatusCodes.Status400BadRequest,
                     "Invalid request",
                     ex.Message)),

            InvalidOperationException =>
                (StatusCodes.Status400BadRequest,
                 CreateProblemDetails(
                     context,
                     StatusCodes.Status400BadRequest,
                     "Invalid operation",
                     ex.Message)),

            UnauthorizedAccessException =>
                (StatusCodes.Status401Unauthorized,
                 CreateProblemDetails(
                     context,
                     StatusCodes.Status401Unauthorized,
                     "Unauthorized",
                     ex.Message)),

            ForbiddenException =>
                (StatusCodes.Status403Forbidden,
                 CreateProblemDetails(
                     context,
                     StatusCodes.Status403Forbidden,
                     "Forbidden",
                     ex.Message)),

            _ =>
                (StatusCodes.Status500InternalServerError,
                 CreateProblemDetails(
                     context,
                     StatusCodes.Status500InternalServerError,
                     "Server error",
                     "An unexpected error occurred while processing the request."))
        };

        context.Response.StatusCode = statusCode;

        var json = JsonSerializer.Serialize(problemDetails);
        await context.Response.WriteAsync(json);
    }

    private static ProblemDetails CreateProblemDetails(
        HttpContext context,
        int statusCode,
        string title,
        string detail)
    {
        return new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{statusCode}",
            Title = title,
            Status = statusCode,
            Detail = detail,
            Instance = context.Request.Path
        };
    }

    private static ProblemDetails CreateValidationProblemDetails(
        HttpContext context,
        ValidationException validationException)
    {
        var errors = validationException.Errors
            .GroupBy(x => x.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => x.ErrorMessage).ToArray());

        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7807#section-3.1",
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Detail = "See the errors property for more details.",
            Instance = context.Request.Path
        };

        problemDetails.Extensions["errors"] = errors;

        return problemDetails;
    }
}
