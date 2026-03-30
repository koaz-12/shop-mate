import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Ensure NEXT_PUBLIC_GEMINI_API_KEY (or simple GEMINI_API_KEY) is in .env.local
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json(
            { error: 'Gemini API key no configurada en el servidor' },
            { status: 500 }
        );
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const { imageBase64 } = await req.json();

        if (!imageBase64) {
             return NextResponse.json({ error: 'No se envió ninguna imagen' }, { status: 400 });
        }

        // Prepare the image part
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg"
            },
        };

        const prompt = `
            Eres un asistente especializado en extraer listas de compras y recibos (tickets de supermercado).
            Analiza la imagen enviada.
            Busca todos los productos comprados junto con su precio (si está visible) y si es posible, la cantidad.
            Ignora totales, subtotales, impuestos, nombre de la tienda, y otra información no relevante.
            Debes retornar ÚNICAMENTE un array en formato JSON con la siguiente estructura y sin ningún otro texto o marca markdown:
            [
              {
                "name": "Nombre del producto limpio",
                "price": 0.00,
                "quantity": "1"
              }
            ]
            Asegúrate de que 'price' sea un número y 'quantity' un string.
            Si no hay productos, retorna un array vacío [].
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Clean up markdown markers if Gemini returned them
        const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
            const parsedArray = JSON.parse(cleanedText);
            return NextResponse.json({ items: parsedArray }, { status: 200 });
        } catch (jsonError) {
             console.error("Error parsing Gemini JSON:", jsonError, cleanedText);
             return NextResponse.json({ error: 'Error al procesar la respuesta de Gemini OCR' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Gemini OCR Error:", error);
        return NextResponse.json(
            { error: error?.message || 'Error desconocido procesando la imagen' },
            { status: 500 }
        );
    }
}
