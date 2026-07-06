namespace ItemNest.Application.Configurations;

public class AwsSettings
{
    public const string SectionName = "Aws";

    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
}
