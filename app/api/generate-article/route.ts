import { NextResponse } from "next/server";
import { publishSpecificKeywordAsync, publishQueueItemByIdAsync, addKeywordsToQueue, getKeywordQueue, clearPublishedStore, clearKeywordQueue } from "@/lib/automation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, keywords, category, action, id, existingSlugs } = body;
    const clientSlugsList = Array.isArray(existingSlugs) ? existingSlugs : [];

    if (action === "clear-published") {
      clearPublishedStore();
      return NextResponse.json({
        success: true,
        message: "All published articles cleared from server memory and disk cache.",
      });
    }

    if (action === "clear-queue") {
      clearKeywordQueue();
      return NextResponse.json({
        success: true,
        message: "Keyword queue cleared.",
        queue: [],
      });
    }

    if (action === "bulk-add" && keywords) {
      const added = addKeywordsToQueue(keywords, category);
      return NextResponse.json({
        success: true,
        message: `Added ${added.length} keywords to the auto-publish queue.`,
        queue: getKeywordQueue(),
      });
    }

    if (action === "publish-item" && id) {
      const publishedArticle = await publishQueueItemByIdAsync(id, clientSlugsList);
      if (!publishedArticle) {
        return NextResponse.json({ success: false, error: "Queue item not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Queued keyword article generated & published successfully!`,
        article: publishedArticle,
        readUrl: `/${publishedArticle.slug}`,
        queue: getKeywordQueue(),
      });
    }

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid keyword string is required." },
        { status: 400 }
      );
    }

    const publishedArticle = await publishSpecificKeywordAsync(keyword, category, clientSlugsList);

    return NextResponse.json({
      success: true,
      message: `Gemini AI Article for keyword '${keyword}' successfully generated & published!`,
      article: publishedArticle,
      readUrl: `/${publishedArticle.slug}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate article." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    queue: getKeywordQueue(),
  });
}
