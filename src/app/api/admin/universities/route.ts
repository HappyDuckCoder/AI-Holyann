import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const universities = await prisma.universities.findMany({
      include: {
        _count: {
          select: { faculty: true, scholarship: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ universities });
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json(
      { message: 'Failed to fetch universities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const university = await prisma.universities.create({
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

    return NextResponse.json(
      { message: 'University created', university },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating university:', error);
    return NextResponse.json(
      { message: 'Failed to create university' },
      { status: 500 }
    );
  }
}
