import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, deadline, url_web } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: 'Scholarship name is required' },
        { status: 400 }
      );
    }

    const scholarship = await prisma.scholarship.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        url_web: url_web?.trim() || null,
      },
    });

    return NextResponse.json({ message: 'Updated', scholarship });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    return NextResponse.json(
      { message: 'Failed to update scholarship' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.scholarship.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    return NextResponse.json(
      { message: 'Failed to delete scholarship' },
      { status: 500 }
    );
  }
}
