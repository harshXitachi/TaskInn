import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import postgres from 'postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('[Categories API] GET request, id:', id);

    // Single category by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID' 
          },
          { status: 400 }
        );
      }

      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(category[0], { status: 200 });
    }

    // List all categories ordered by name
    console.log('[Categories API] Fetching all categories...');
    const allCategories = await db.select()
      .from(categories)
      .orderBy(asc(categories.name));

    console.log('[Categories API] Found', allCategories.length, 'categories');
    return NextResponse.json(allCategories, { status: 200 });

  } catch (error) {
    console.error('[Categories API] Error:', error);
    
    // Fallback to raw SQL query
    try {
      console.log('[Categories API] Trying raw SQL fallback...');
      const sql = postgres(process.env.DATABASE_URL!);
      const result = await sql`SELECT * FROM categories ORDER BY name ASC`;
      await sql.end();
      console.log('[Categories API] Raw SQL returned', result.length, 'categories');
      return NextResponse.json(result, { status: 200 });
    } catch (fallbackError) {
      console.error('[Categories API] Fallback error:', fallbackError);
      return NextResponse.json(
        { error: 'Internal server error: ' + (error as Error).message },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;

    // Validate required field
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Name is required and must be a non-empty string',
          code: 'MISSING_REQUIRED_FIELD' 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description ? description.trim() : null;
    const sanitizedIcon = icon ? icon.trim() : null;

    // Create new category
    const newCategory = await db.insert(categories)
      .values({
        name: sanitizedName,
        description: sanitizedDescription,
        icon: sanitizedIcon,
        // createdAt will use database default
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, icon } = body;

    // Build update object with only provided fields
    const updates: Record<string, string | null> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Name must be a non-empty string',
            code: 'INVALID_NAME' 
          },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (icon !== undefined) {
      updates.icon = icon ? icon.trim() : null;
    }

    // Update category
    const updatedCategory = await db.update(categories)
      .set(updates)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedCategory[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Delete category
    const deletedCategory = await db.delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { 
        message: 'Category deleted successfully',
        category: deletedCategory[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}