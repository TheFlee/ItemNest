using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ItemNest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddItemImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "ItemImages",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "ItemImages",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "ItemImages",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "StoredFileName",
                table: "ItemImages",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "ItemImages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "ItemImages");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "ItemImages");

            migrationBuilder.DropColumn(
                name: "StoredFileName",
                table: "ItemImages");
        }
    }
}
