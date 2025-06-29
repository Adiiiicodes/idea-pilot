import { NextResponse } from 'next/server';

// The backend URL from environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    console.log('API Route: Handling generate-project request');
    
    // Get the request body
    let body = {};
    try {
      body = await request.json();
      console.log('API Route: Request body:', body);
    } catch (e) {
      console.log('API Route: Error parsing request body:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    const { conceptText, experienceLevel, domain } = body as any;
    if (!conceptText || typeof conceptText !== 'string' || conceptText.trim().length === 0) {
      return NextResponse.json(
        { error: 'conceptText is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    if (typeof experienceLevel !== 'number' || experienceLevel < 1 || experienceLevel > 3) {
      return NextResponse.json(
        { error: 'experienceLevel must be a number between 1 and 3' },
        { status: 400 }
      );
    }
    
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'domain is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Use the correct path to the API endpoint
    const apiUrl = `${BACKEND_URL}/api/generate-project`;
    console.log(`API Route: Forwarding request to ${apiUrl}`);
    
    // Forward the request to your Flask backend
    const backendResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Log the response status for debugging
    console.log('API Route: Backend response status:', backendResponse.status);
    console.log('API Route: Backend response headers:', Object.fromEntries(backendResponse.headers.entries()));
    
    // Get the response as text first (in case it's not valid JSON)
    const responseText = await backendResponse.text();
    console.log('API Route: Response text preview:', responseText.substring(0, 200));
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('API Route: Successfully parsed response as JSON');
    } catch (error) {
      console.error('API Route: Error parsing response as JSON');
      console.error('API Route: Parse error:', error);
      
      // Return the error with a preview of the response
      return NextResponse.json(
        { 
          error: 'Invalid JSON response from backend',
          details: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          backend_status: backendResponse.status
        },
        { status: 502 }
      );
    }
    
    // Check if backend returned an error status
    if (!backendResponse.ok) {
      console.error('API Route: Backend returned error status:', backendResponse.status);
      console.error('API Route: Backend error data:', responseData);
      
      // Forward the backend error to the frontend
      return NextResponse.json(
        responseData,
        { status: backendResponse.status }
      );
    }
    
    // Validate the response structure
    if (!responseData || typeof responseData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid response structure from backend' },
        { status: 502 }
      );
    }
    
    // Forward the JSON response to the frontend
    return NextResponse.json(responseData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: unknown) {
    console.error('API Route: Error processing request:', error);
    
    // Return an error response with detailed information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to backend server',
        details: errorMessage,
        stack: errorDetails
      },
      { status: 500 }
    );
  }
}