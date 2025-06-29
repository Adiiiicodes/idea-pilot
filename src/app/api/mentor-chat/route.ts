import { NextResponse } from 'next/server';

// The backend URL from environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json();
    console.log('Mentor chat request:', body);
    
    // Use environment variable for backend URL
    const apiUrl = `${BACKEND_URL}/api/mentor-chat`;
    
    console.log(`Forwarding mentor chat request to: ${apiUrl}`);
    
    // Forward the request to your Flask backend
    const backendResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend mentor chat response status:', backendResponse.status);
    
    // Get the response as text first
    const responseText = await backendResponse.text();
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Received mentor chat response');
    } catch (error) {
      console.error('Error parsing mentor chat response as JSON:', error);
      return NextResponse.json(
        { 
          error: 'Invalid JSON response from backend',
          details: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
        },
        { status: 500 }
      );
    }
    
    // Return the mentor chat response to the frontend
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error processing mentor chat request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get AI mentor response',
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}