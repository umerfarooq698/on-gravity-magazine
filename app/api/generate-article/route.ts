import { NextResponse } from "next/server";
import { publishSpecificKeywordAsync, addKeywordsToQueue, getKeywordQueue } from "@/lib/automation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, keywords, category, action } = body;

    if (action === "bulk-add" && keywords) {
      const added = addKeywordsToQueue(keywords, category);
      return NextResponse.json({
        success: true,
        message: `Added ${added.length} keywords to the auto-publish queue.`,
        queue: getKeywordQueue(),
      });
    }

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid keyword string is required." },
        { status: 400 }
      );
    }

    const publishedArticle = await publishSpecificKeywordAsync(keyword, category);

    return NextResponse.json({
      success: true,
      message: `Gemini AI Article for keyword '${keyword}' successfully generated & published!`,
      article: publishedArticle,
      readUrl: `/on-gravity-magazine/${publishedArticle.slug}`,
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
