import chromium from "@sparticuz/chromium-min";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RenderPayload = {
  html: string;
  css?: string;
  filename?: string;
};

// Check if HTML is already a full document
function isFullHtmlDocument(html: string): boolean {
  const trimmed = html.trim();
  return (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html")
  );
}

function buildHtmlDocument(html: string, css?: string): string {
  // If it's already a full HTML document, return it as is
  if (isFullHtmlDocument(html)) {
    console.log("Using full HTML document directly");
    return html;
  }

  // Otherwise, wrap the HTML fragment in a document
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Load Cairo font for Arabic text support -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>try{window.tailwind={}}catch{}</script>
    <script>tailwind.config = { corePlugins: { preflight: false } };</script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Ensure clean PDF canvas */
      @page { size: A4; margin: 0; }
      /* Use PDF margins only; avoid body padding to prevent overflow to a second page */
      html, body { margin: 0; padding: 0; background: #ffffff; color: #111827; }
      /* Force Cairo font for Arabic text support */
      body { font-family: 'Cairo', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }
      * { font-family: 'Cairo', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }
    </style>
    ${css ? `<style>${css}</style>` : ""}
  </head>
  <body>
    <div id="root" class="preview-scope">${html}</div>
  </body>
</html>`;
}

export async function POST(req: Request) {
  try {
    console.log("PDF render request received");
    const payload = (await req.json()) as RenderPayload;
    const { html, css, filename } = payload || {};
    
    console.log("HTML length:", html?.length);
    console.log("CSS length:", css?.length);
    
    if (!html || typeof html !== "string") {
      console.error("Missing or invalid HTML in request");
      return new Response(JSON.stringify({ error: "Missing 'html' in body" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const isProd =
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL_ENV === "production";

    console.log("Environment:", isProd ? "production" : "development");

    const browser = isProd
      ? await (
          await import("puppeteer-core")
        ).default.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(
            "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar",
          ),
          headless: true,
        })
      : await (
          await import("puppeteer")
        ).default.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        });
    
    console.log("Browser launched successfully");
    const page = await browser.newPage();
    console.log("New page created");
    
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    console.log("Viewport set");
    
    const htmlDocument = buildHtmlDocument(html, css);
    console.log("HTML document built, length:", htmlDocument.length);
    
    // Set content and wait for all resources to load
    await page.setContent(htmlDocument, {
      waitUntil: ["load", "networkidle0", "domcontentloaded"],
    });
    console.log("Page content set");

    // Add a longer delay to ensure fonts are fully loaded and rendered
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Wait timeout completed");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      // Apply margins here (no body padding) so short content stays on a single page
      margin: { top: "12px", right: "0", bottom: "12px", left: "0" },
      preferCSSPageSize: true,
    });
    console.log("PDF generated, buffer size:", pdfBuffer.length);

    await page.close();
    await browser.close();

    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength,
    );
    
    const safeFilename = filename?.replace(/[^a-zA-Z0-9-_\.]/g, '_') || 'invoice.pdf';
    
    return new Response(arrayBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${safeFilename}"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("render-pdf failed", message);
    return new Response(
      JSON.stringify({ error: "Failed to render PDF", message }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
