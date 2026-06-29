import { errorResponse, jsonResponse } from '../../utils';

export async function handleUploadRoute(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;

  if (url.pathname !== '/api/upload') {
    return null;
  }

  if (method !== 'POST') {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const formData = await context.request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) return errorResponse("Image required", 400);

    const apiKey = (context.env as any).VITE_IMGBB_API_KEY;
    if (!apiKey) return errorResponse("ImgBB API key not configured in backend", 500);

    const imgbbFormData = new FormData();
    imgbbFormData.append('image', imageFile);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: imgbbFormData,
    });

    if (!response.ok) {
        const errorData = await response.json() as any;
        return errorResponse(errorData?.error?.message || "Failed to upload image", response.status);
    }

    const data = await response.json() as any;
    return jsonResponse({ success: true, url: data.data.url });
  } catch (error: any) {
    return errorResponse(`Upload handler error: ${error.message}`, 500);
  }
}
