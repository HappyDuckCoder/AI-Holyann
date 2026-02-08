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
    const { name, description, deadline, url_web } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: 'Scholarship name is required' },
        { status: 400 }
      );
    }

    const scholarship = await prisma.scholarship.create({
      data: {
        universities_id: universityId,
        name: name.trim(),
        description: description?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        url_web: url_web?.trim() || null,
      },
    });

    return NextResponse.json(
      { message: 'Scholarship created', scholarship },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating scholarship:', error);
    return NextResponse.json(
      { message: 'Failed to create scholarship' },
      { status: 500 }
    );
  }
}
