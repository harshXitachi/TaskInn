import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const password = 'admin';
    const saltRounds = 10;
    
    const hash = bcrypt.hashSync(password, saltRounds);
    
    return NextResponse.json({
      password: password,
      hash: hash
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}