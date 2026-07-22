using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ItemNest.Infrastructure.Services;

public class ChatCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ChatCleanupService> _logger;

    public ChatCleanupService(IServiceScopeFactory scopeFactory, ILogger<ChatCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTimeOffset.UtcNow;
            var nextMidnight = new DateTimeOffset(now.Date.AddDays(1), TimeSpan.Zero);
            await Task.Delay(nextMidnight - now, stoppingToken);

            try
            {
                await CleanupAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Chat cleanup failed");
            }
        }
    }

    private async Task CleanupAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ItemNestDbContext>();

        var cutoff = DateTimeOffset.UtcNow.AddDays(-60);

        var oldMessages = await context.ChatMessages
            .Where(x => x.SentAt < cutoff)
            .ToListAsync(ct);

        context.ChatMessages.RemoveRange(oldMessages);
        await context.SaveChangesAsync(ct);

        // Delete chats that now have no messages
        var emptyChatIds = await context.Chats
            .Where(x => !context.ChatMessages.Any(m => m.ChatId == x.Id))
            .Select(x => x.Id)
            .ToListAsync(ct);

        var emptyChats = await context.Chats
            .Where(x => emptyChatIds.Contains(x.Id))
            .ToListAsync(ct);

        context.Chats.RemoveRange(emptyChats);
        await context.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Chat cleanup complete: {Messages} messages and {Chats} empty chats deleted",
            oldMessages.Count, emptyChats.Count);
    }
}
