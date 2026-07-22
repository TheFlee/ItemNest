using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ItemNest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSlugToItemPost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "ItemPosts",
                type: "character varying(220)",
                maxLength: 220,
                nullable: false,
                defaultValue: "");

            // Generate slugs for existing rows: slugified title + first 6 chars of UUID
            migrationBuilder.Sql(@"
                UPDATE ""ItemPosts""
                SET ""Slug"" = LOWER(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(TRIM(""Title""), '[^a-zA-Z0-9\s]', '', 'g'),
                        '\s+', '-', 'g'
                    )
                ) || '-' || LOWER(LEFT(REPLACE(CAST(""Id"" AS TEXT), '-', ''), 6))
                WHERE ""Slug"" = '';
            ");

            migrationBuilder.CreateIndex(
                name: "IX_ItemPosts_Slug",
                table: "ItemPosts",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ItemPosts_Slug",
                table: "ItemPosts");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "ItemPosts");
        }
    }
}
