import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const parseId = (id: string) => {
  const n = parseInt(id, 10);
  return Number.isNaN(n) ? null : n;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseId(id);
    if (numId == null) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    const university = await prisma.universities.findUnique({
      where: { id: numId },
      include: {
        faculty: true,
        scholarship: true,
      },
    });

    if (!university) {
      return NextResponse.json({ message: 'University not found' }, { status: 404 });
    }

    return NextResponse.json({ university });
  } catch (error) {
    console.error('Error fetching university:', error);
    return NextResponse.json(
      { message: 'Failed to fetch university' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseId(id);
    if (numId == null) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      country,
      state,
      current_ranking,
      website_url,
      logo_url,
      essay_requirements,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    const university = await prisma.universities.update({
      where: { id: numId },
      data: {
        name: name.trim(),
        country: country?.trim() || null,
        state: state?.trim() || null,
        current_ranking:
          current_ranking != null && current_ranking !== ''
            ? Number(current_ranking)
            : null,
        website_url: website_url?.trim() || null,
        logo_url: logo_url?.trim() || null,
        essay_requirements: essay_requirements?.trim() || null,
      },
    });

    return NextResponse.json({ message: 'Updated', university });
  } catch (error) {
    console.error('Error updating university:', error);
    return NextResponse.json(
      { message: 'Failed to update university' },
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
    const numId = parseId(id);
    if (numId == null) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    await prisma.universities.delete({
      where: { id: numId },
    });

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting university:', error);
    return NextResponse.json(
      { message: 'Failed to delete university' },
      { status: 500 }
    );
  }
}
