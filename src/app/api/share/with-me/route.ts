import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Wymusza dynamiczne renderowanie

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sharedWithMeFiles = await prisma.libraryFile.findMany({
      where: {
        shares: {
          some: {
            OR: [
              { sharedToAdminId: userId },
              { sharedToTeacherId: userId },
              { sharedToStudentId: userId },
              { sharedToParentId: userId }
            ]
          }
        }
      },
      include: {
        shares: {
          where: {
            OR: [
              { sharedToAdminId: userId },
              { sharedToTeacherId: userId },
              { sharedToStudentId: userId },
              { sharedToParentId: userId }
            ]
          },
          include: {
            sharedByAdmin: {
              select: { username: true, email: true }
            },
            sharedByTeacher: {
              select: { username: true, email: true }
            },
            sharedByStudent: {
              select: { username: true, email: true }
            },
            sharedByParent: {
              select: { username: true, email: true }
            }
          }
        }
      },
      take: 50 // Ogranicza liczbę zwracanych plików
    });

    return NextResponse.json(sharedWithMeFiles);
  } catch (error) {
    console.error("Error getting files shared with me:", error);
    return NextResponse.json(
      { error: "Failed to get shared files" },
      { status: 500 }
    );
  }
}