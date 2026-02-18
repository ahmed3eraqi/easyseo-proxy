import cheerio from "cheerio";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing ?url parameter", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl);
    const html = await response.text();

    const $ = cheerio.load(html);

    // Fix lang
    if (!$("html").attr("lang")) {
      $("html").attr("lang", "ar");
    }

    // Remove old meta description
    $('meta[name="description"]').remove();

    // Inject new meta description
    $("head").append(`
      <meta name="description" content="تسوق أفضل المنتجات بجودة عالية وأسعار تنافسية مع شحن سريع وخدمة موثوقة.">
    `);

    // Open Graph
    $("head").append(`
      <meta property="og:title" content="${$("title").text()}">
      <meta property="og:description" content="أفضل اختيار لك بجودة مضمونة وأسعار ممتازة.">
      <meta property="og:type" content="product">
      <meta property="og:url" content="${targetUrl}">
    `);

    // Canonical
    $("head").append(`
      <link rel="canonical" href="${targetUrl}">
    `);

    return new Response($.html(), {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    return new Response("Error fetching page", { status: 500 });
  }
}
