import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response('No file received.', { status: 400 });
    }

    // Create form data for the Barikoi API
    const barikoiFormData = new FormData();
    barikoiFormData.append('file', file);

    // Forward the request to the Barikoi API
    const response = await fetch('https://usage.bmapsbd.com/view', {
      method: 'POST',
      body: barikoiFormData,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Send back the processed data
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return new Response(JSON.stringify({ error: 'Failed to process image' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
