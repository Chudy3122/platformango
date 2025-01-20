import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic'; // Wymusza dynamiczne renderowanie

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('query') || '';

    // Wyszukiwanie we wszystkich typach użytkowników jednocześnie
    const [admins, teachers, parents, students] = await Promise.all([
      // Wyszukiwanie adminów
      prisma.admin.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
          ],
          NOT: { id: session.userId }
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
        take: 10 // Ogranicz liczbę zwracanych adminów
      }),

      // Wyszukiwanie nauczycieli
      prisma.teacher.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { surname: { contains: searchQuery, mode: 'insensitive' } },
          ],
          NOT: { id: session.userId }
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
        },
        take: 10 // Ogranicz liczbę zwracanych nauczycieli
      }),

      // Wyszukiwanie rodziców
      prisma.parent.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { surname: { contains: searchQuery, mode: 'insensitive' } },
          ],
          NOT: { id: session.userId }
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
        },
        take: 10 // Ogranicz liczbę zwracanych rodziców
      }),

      // Wyszukiwanie uczniów
      prisma.student.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { surname: { contains: searchQuery, mode: 'insensitive' } },
          ],
          NOT: { id: session.userId }
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
        },
        take: 10 // Ogranicz liczbę zwracanych uczniów
      })
    ]);

    // Łączenie wyników z odpowiednimi rolami
    const formattedResults = [
      ...admins.map(user => ({ 
        ...user, 
        role: 'ADMIN',
        displayName: user.name || user.username
      })),
      ...teachers.map(user => ({ 
        ...user, 
        role: 'TEACHER',
        displayName: `${user.name} ${user.surname}`
      })),
      ...parents.map(user => ({ 
        ...user, 
        role: 'PARENT',
        displayName: `${user.name} ${user.surname}`
      })),
      ...students.map(user => ({ 
        ...user, 
        role: 'STUDENT',
        displayName: `${user.name} ${user.surname}`
      }))
    ];

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}