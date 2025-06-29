import { NextResponse } from 'next/server';

// The backend URL from environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    console.log('Handling save-project request');

    // Get request body
    const body = await request.json();
    console.log('Request body:', body);

    // Use the environment variable for backend URL
    const apiUrl = `${BACKEND_URL}/api/save-project`;
    console.log(`Forwarding request to ${apiUrl}`);

    // Make the request
    const backendResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log('Backend response status:', backendResponse.status);
    
    const responseText = await backendResponse.text();
    console.log('Response text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parsing response as JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON response from backend', details: responseText },
        { status: 500 }
      );
    }
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to backend server',
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}