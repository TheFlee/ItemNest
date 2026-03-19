using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ItemNest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContactRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequesterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PostOwnerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemPostId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactRequests_AspNetUsers_PostOwnerUserId",
                        column: x => x.PostOwnerUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContactRequests_AspNetUsers_RequesterUserId",
                        column: x => x.RequesterUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContactRequests_ItemPosts_ItemPostId",
                        column: x => x.ItemPostId,
                        principalTable: "ItemPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContactRequests_ItemPostId",
                table: "ContactRequests",
                column: "ItemPostId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactRequests_PostOwnerUserId",
                table: "ContactRequests",
                column: "PostOwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactRequests_RequesterUserId_ItemPostId_Status",
                table: "ContactRequests",
                columns: new[] { "RequesterUserId", "ItemPostId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactRequests");
        }
    }
}
