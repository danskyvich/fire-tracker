using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FireDetections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    latitude = table.Column<double>(type: "double precision", nullable: false),
                    longitude = table.Column<double>(type: "double precision", nullable: false),
                    bright_ti4 = table.Column<double>(type: "double precision", nullable: false),
                    bright_ti5 = table.Column<double>(type: "double precision", nullable: false),
                    confidence = table.Column<string>(type: "text", nullable: false),
                    acq_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    acq_time = table.Column<string>(type: "text", nullable: false),
                    acquired_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    satellite = table.Column<string>(type: "text", nullable: false),
                    frp = table.Column<double>(type: "double precision", nullable: false),
                    daynight = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FireDetections", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FireDetections_latitude_longitude_acquired_at_satellite",
                table: "FireDetections",
                columns: new[] { "latitude", "longitude", "acquired_at", "satellite" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FireDetections");
        }
    }
}
