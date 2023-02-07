using Microsoft.AspNetCore.Mvc;

using QuestPDF.Drawing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Beader.Controllers {
    [ApiController]
    [Route("[controller]")]
    public class GenerateController : ControllerBase {

        public GenerateController() { }

        /// <summary>Generates a PDF document with the provided Perler bead layout.</summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> Get() {
            // The HTTP body is being submitted as application/x-www-formurlencoded so we can't use ASP.NET built-in deserialization.
            // However, the body is a JSON document, so deserialize it manually.
            var form = await HttpContext.Request.ReadFormAsync();
            var formData = form["data"];
            var data = System.Text.Json.JsonSerializer.Deserialize<Data>(formData)!;

            // These values were determine through trial and error.
            const float RADIUS = 7.08f;
            const float STROKE = 0.3f;

            // Use whatever width the client specifies.  If the width is LTE 40 then use portrait aspect ratio, otherwise use landscape.
            int COLS = data.width;
            float width;
            float height;
            if (COLS <= 40) {
                width = 8.5f;
                height = 11f;
            } else {
                width = 11f;
                height = 8.5f;
            }

            var ms = new MemoryStream();

            Document.Create(document => {
                document.Page(page => {
                    page.Margin(25);
                    page.MarginTop(30);

                    page.Size(new PageSize(width, height, Unit.Inch));

                    page.Content().Container().Canvas((canvas, size) => {
                        // Pre-create standard brushes.
                        using var empty_circle = new SkiaSharp.SKPaint
                        {
                            Color = SkiaSharp.SKColor.Parse("#000000"),
                            IsStroke = true,
                            StrokeWidth = STROKE,
                            IsAntialias = true
                        };

                        using var text_paint = new SkiaSharp.SKPaint
                        {
                            Color = SkiaSharp.SKColor.Parse("#000000"),
                            IsStroke = false,
                            TextSize = 14,
                            IsAntialias = true
                        };

                        // Put the title and date/time at the top of the document.
                        canvas.DrawText(data.title ?? "Untitled", 0, -10, text_paint);
                        string rightHeaderText = "etsy.com/shop/SuperBeadShop";
                        float rightHeaderTextWidth = text_paint.MeasureText(rightHeaderText);
                        canvas.DrawText(rightHeaderText, size.Width - rightHeaderTextWidth, -10, text_paint);

                        int i = 0;
                        int j = 0;
                        var dict = new Dictionary<string, int>();
                        foreach (var color in data.beads) {
                            // Create a new paint for each bead.  This could be optimized by creating a dictionary keyed on color, but it doesn't seem necessary for my purposes.  Not exactly sure how the lifetime would work.
                            using var paint = new SkiaSharp.SKPaint
                            {
                                Color = SkiaSharp.SKColor.Parse(color),
                                IsStroke = false,
                                StrokeWidth = STROKE,
                                IsAntialias = true
                            };

                            float cx = i * RADIUS * 2;
                            float cy = j * RADIUS * 2;
                            cx += RADIUS;
                            cy += RADIUS;

                            canvas.DrawCircle(cx, cy, RADIUS, paint);
                            canvas.DrawCircle(cx, cy, RADIUS, empty_circle); // Black circle around every location.

                            i++;
                            if (i == COLS) {
                                // Once we draw all the columns, go to the next line.
                                i = 0;
                                j++;
                            }

                            if (dict.ContainsKey(color)) {
                                dict[color]++;
                            } else {
                                dict[color] = 1;
                            }
                        }

                        // 2 - Sort by count.
                        var list = new List<(string color, int count)>();
                        foreach (var (color, count) in dict) {
                            if (String.Equals(color, "#ffffff", StringComparison.OrdinalIgnoreCase)) continue;
                            list.Add((color, count));
                        }

                        var ordered = list.OrderByDescending(x => x.count).Take(25);

                        const int marginSize = 6;
                        int idx = 0;
                        var gridWidth = RADIUS * 2 * COLS;
                        var gridHeight = (RADIUS * 2 * data.height) + 2;
                        foreach (var (color, count) in ordered) {
                            float x = 0, y = 0;

                            if (data.height > data.width) {
                                x = (idx * RADIUS * 3) + (RADIUS * 1.5f);
                                y = gridHeight + (RADIUS) + 4;
                            } else {
                                x = gridWidth + (RADIUS) + 8;
                                y = (idx * RADIUS * 3) + (RADIUS * 1.5f);
                            }

                            using var paint = new SkiaSharp.SKPaint
                            {
                                Color = SkiaSharp.SKColor.Parse(color),
                                IsStroke = false,
                                StrokeWidth = STROKE,
                                IsAntialias = true
                            };

                            canvas.DrawCircle(x, y, RADIUS * 1.5f, paint);

                            // Draw the number of beads inside the circle.
                            //ctx.font = "12px sans-serif";
                            //const tm = ctx.measureText(obj.count);
                            //const tw = tm.width;
                            //const th = tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent;
                            //ctx.fillStyle = '#000000';
                            //ctx.shadowColor = '#000000AA';
                            //ctx.shadowBlur = 3;
                            //ctx.strokeText(obj.count, x - (tw / 2), y + (th / 2));
                            //ctx.fillStyle = '#ffffff';
                            //ctx.shadowBlur = 0;
                            //ctx.fillText(obj.count, x - (tw / 2), y + (th / 2));
                            idx++;
                        }
                    });
                });
            }).WithMetadata(new DocumentMetadata()
            {
                Title = "Pearler Bead Layout",
                Author = "",
                Creator = "Perler Bead Generator - https://beader.azurewebsites.net",
                CreationDate = DateTime.Now,
                Producer = "QuestPDF"
            }).GeneratePdf(ms);

            ms.Position = 0;

            return File(ms, "application/pdf");
        }

        private record Data {
            public string? title { get; init; }
            public int width { get; init; }
            public int height { get; init; }
            public IEnumerable<string> beads { get; init; } = default!;
        }
    }
}