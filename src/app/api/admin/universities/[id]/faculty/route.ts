import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const parseId = (id: string) => {
  const n = parseInt(id, 10);
  return Number.isNaN(n) ? null : n;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const universityId = parseId(id);
    if (universityId == null) {
      return NextResponse.json({ message: 'Invalid university id' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, type, url_web } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: 'Faculty name is required' },
        { status: 400 }
      );
    }

    const faculty = await prisma.faculty.create({
      data: {
        university_id: universityId,
        name: name.trim(),
        description: description?.trim() || null,
        type: type?.trim() || null,
        url_web: url_web?.trim() || null,
      },
    });

    return NextResponse.json(
      { message: 'Faculty created', faculty },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating faculty:', error);
    return NextResponse.json(
      { message: 'Failed to create faculty' },
      { status: 500 }
    );
  }
}
