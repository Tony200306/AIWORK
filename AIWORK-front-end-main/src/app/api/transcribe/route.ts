import { createClient } from '@deepgram/sdk';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
        return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const deepgram = createClient(deepgramApiKey);

        // Convert Blob to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            buffer,
            {
                model: 'nova-2',
                smart_format: true,
            }
        );

        if (error) {
            console.error('Deepgram error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ text: result.results.channels[0].alternatives[0].transcript });
    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
