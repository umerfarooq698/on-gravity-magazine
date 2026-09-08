import { NextResponse } from "next/server";
import { publishNextKeyword, getKeywordQueue } from "@/lib/automation";

export async function GET() {
  try {
    const article = publishNextKeyword();

    if (!article) {
      return NextResponse.json({
        success: true,
        message: "No pending keywords in queue to publish.",
        queue: getKeywordQueue(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Cron automated publishing triggered! Article '${article.title}' published.`,
      article,
      readUrl: `/article/${article.slug}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Cron publish failed." },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
