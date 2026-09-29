import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getGradebookData, generateGradebookCsv } from "@/lib/services/gradebook-service";
import { canManageCourse } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");
  const format = searchParams.get("format");

  if (!courseId) {
    return NextResponse.json({ error: "courseId parameter is required" }, { status: 400 });
  }

  const allowed = await canManageCourse(user.id, courseId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await getGradebookData(courseId);

    if (format === "csv") {
      const csv = generateGradebookCsv(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="gradebook-${data.courseTitle.toLowerCase().replace(/\s+/g, "-")}.csv"`,
        },
      });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Gradebook error:", error);
    return NextResponse.json({ error: error.message || "Failed to load gradebook" }, { status: 500 });
  }
}
