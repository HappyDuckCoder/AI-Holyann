import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, type, url_web } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: 'Faculty name is required' },
        { status: 400 }
      );
    }

    const faculty = await prisma.faculty.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: type?.trim() || null,
        url_web: url_web?.trim() || null,
      },
    });

    return NextResponse.json({ message: 'Updated', faculty });
  } catch (error) {
    console.error('Error updating faculty:', error);
    return NextResponse.json(
      { message: 'Failed to update faculty' },
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
    await prisma.faculty.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return NextResponse.json(
      { message: 'Failed to delete faculty' },
      { status: 500 }
    );
  }
}
