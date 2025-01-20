// app/api/resources/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
 try {
   const { userId } = await auth(); // Dodaj await

   // Jeśli użytkownik nie jest zalogowany, zwróć błąd autoryzacji
   if (!userId) {
     return NextResponse.json(
       { error: "Unauthorized access" }, 
       { status: 401 }
     );
   }

   const url = new URL(request.url);
   const section = url.searchParams.get("section");

   const files = await prisma.resource.findMany({
     where: {
       section: section || undefined
     },
     select: {
       id: true,
       name: true,
       description: true,
       mimeType: true,
       size: true,
       section: true,
       uploadedAt: true,
       downloads: true,
     },
     // Opcjonalnie: ogranicz ilość zwracanych plików
     take: 50 
   });

   return NextResponse.json(files);
 } catch (error) {
   console.error("Error fetching files:", error);
   return NextResponse.json(
     { error: "Failed to fetch files" },
     { status: 500 }
   );
 }
}