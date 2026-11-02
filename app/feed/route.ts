import { GET as getRss } from "../rss.xml/route";

export const revalidate = 60;

export async function GET() {
  return getRss();
}
