namespace ItemNest.Application.Configurations;

public class AwsSettings
{
    public const string SectionName = "Aws";

    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
    public string AccountId { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
}
