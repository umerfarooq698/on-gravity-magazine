<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom"
                xmlns:media="http://search.yahoo.com/mrss/">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex, nofollow"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #09090b;
            color: #f4f4f5;
            line-height: 1.6;
            padding: 24px 16px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
          }
          .header {
            border-bottom: 2px solid #dc2626;
            padding-bottom: 24px;
            margin-bottom: 32px;
          }
          .brand {
            display: inline-block;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -0.5px;
            text-transform: uppercase;
            color: #ffffff;
            text-decoration: none;
            margin-bottom: 12px;
          }
          .brand span {
            color: #dc2626;
          }
          .notice {
            background-color: #18181b;
            border-left: 4px solid #dc2626;
            padding: 16px;
            border-radius: 4px;
            font-size: 14px;
            color: #a1a1aa;
            margin-top: 12px;
          }
          .notice strong {
            color: #ffffff;
          }
          .feed-url {
            word-break: break-all;
            color: #ef4444;
            font-family: monospace;
          }
          .articles {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .card {
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: border-color 0.2s;
          }
          @media (min-width: 640px) {
            .card {
              flex-direction: row;
            }
            .card-img {
              width: 240px;
              min-width: 240px;
              height: auto;
            }
          }
          .card-img {
            object-fit: cover;
            width: 100%;
            height: 180px;
            background-color: #27272a;
          }
          .card-body {
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex: 1;
          }
          .category {
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #dc2626;
            margin-bottom: 8px;
          }
          .title {
            font-size: 20px;
            font-weight: 800;
            line-height: 1.3;
            margin-bottom: 10px;
          }
          .title a {
            color: #ffffff;
            text-decoration: none;
          }
          .title a:hover {
            color: #ef4444;
          }
          .description {
            font-size: 14px;
            color: #a1a1aa;
            margin-bottom: 16px;
          }
          .meta {
            font-size: 12px;
            color: #71717a;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #27272a;
            padding-top: 12px;
          }
          .btn-read {
            color: #ffffff;
            background-color: #dc2626;
            padding: 6px 14px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .btn-read:hover {
            background-color: #b91c1c;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <a class="brand" href="{/rss/channel/link}">
              ON GRAVITY <span>MAGAZINE</span>
            </a>
            <p style="color: #a1a1aa; font-size: 15px;">
              <xsl:value-of select="/rss/channel/description"/>
            </p>
            <div class="notice">
              <strong>RSS Web Feed:</strong> This page is formatted for modern browsers. To subscribe in an RSS reader (like Feedly, NetNewsWire, or Apple Podcasts), copy the feed URL:
              <br/>
              <span class="feed-url"><xsl:value-of select="/rss/channel/atom:link/@href"/></span>
            </div>
          </header>

          <main class="articles">
            <xsl:for-each select="/rss/channel/item">
              <article class="card">
                <xsl:if test="media:content/@url">
                  <img class="card-img" src="{media:content/@url}" alt="{title}" loading="lazy"/>
                </xsl:if>
                <div class="card-body">
                  <div>
                    <span class="category"><xsl:value-of select="category"/></span>
                    <h2 class="title">
                      <a href="{link}" target="_blank"><xsl:value-of select="title"/></a>
                    </h2>
                    <p class="description"><xsl:value-of select="description"/></p>
                  </div>
                  <div class="meta">
                    <span>By <strong style="color: #d4d4d8;"><xsl:value-of select="author"/></strong> • <xsl:value-of select="pubDate"/></span>
                    <a class="btn-read" href="{link}" target="_blank">Read Article</a>
                  </div>
                </div>
              </article>
            </xsl:for-each>
          </main>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
