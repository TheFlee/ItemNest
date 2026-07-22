using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ItemNest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveContactRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactRequests");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemPostId = table.Column<Guid>(type: "uuid", nullable: false),
                    PostOwnerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequesterUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false)
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
    }
}
