import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const AI_MODEL = process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-sonnet";

export interface GenerationParams {
  type: "YEARBOOK" | "PORTRAIT";
  userPhotoUrl: string;
  referencePhotoUrl?: string;
  gownColor?: string;
  capColor?: string;
  sashColor?: string;
  background?: string;
  style?: string;
  capOn?: boolean;
  diplomaOn?: boolean;
}

export async function generateImage(
  params: GenerationParams
): Promise<string> {
  const systemPrompt = buildSystemPrompt(params);
  const userPrompt = buildUserPrompt(params);

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt,
          },
          {
            type: "image_url",
            image_url: {
              url: params.userPhotoUrl,
            },
          },
          ...(params.referencePhotoUrl
            ? [
                {
                  type: "image_url" as const,
                  image_url: {
                    url: params.referencePhotoUrl,
                  },
                },
              ]
            : []),
        ],
      },
    ],
    max_tokens: 1024,
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("No response from OpenRouter API");
  }

  // Parse image URL from response (format: ![alt](url))
  const urlMatch = result.match(/!\[.*?\]\((.*?)\)/);
  if (!urlMatch) {
    throw new Error("No image URL in API response");
  }

  return urlMatch[1];
}

function buildSystemPrompt(params: GenerationParams): string {
  if (params.type === "YEARBOOK") {
    return `You are a professional graduation portrait AI. Generate formal yearbook-style graduation photos.

IMPORTANT RULES:
1. Use the user's selfie to create a natural-looking graduation portrait
2. If a reference image is provided, match ONLY the gown style, cap style, lighting, and overall composition
3. NEVER copy or replicate the person in the reference image
4. Reference images are used only to match visual style, not identity
5. The output must be a single person (the user) in graduation attire
6. Maintain professional yearbook quality and lighting
7. Output ONLY the image URL in markdown format: ![photo](URL)`;
  }

  return `You are a professional graduation portrait AI. Generate cinematic graduation photos with beautiful backgrounds.

IMPORTANT RULES:
1. Place the user in an elegant graduation portrait
2. Use the specified background: ${params.background ?? "studio"}
3. Apply the style: ${params.style ?? "cinematic"}
4. Maintain professional quality with natural lighting
5. Output ONLY the image URL in markdown format: ![photo](URL)`;
}

function buildUserPrompt(params: GenerationParams): string {
  if (params.type === "YEARBOOK") {
    let prompt = `Create a formal yearbook-style graduation portrait. `;

    if (params.gownColor) {
      prompt += `Use a ${params.gownColor} gown. `;
    }
    if (params.capColor) {
      prompt += `Use a ${params.capColor} cap. `;
    }
    if (params.sashColor) {
      prompt += `Add a ${params.sashColor} sash/stole. `;
    }

    prompt += params.capOn !== false ? "Cap should be worn. " : "No cap. ";
    prompt += params.diplomaOn ? "Include a diploma. " : "";

    if (params.referencePhotoUrl) {
      prompt +=
        "\n\nUse the second image as a style reference for gown/cap/lighting only. Replace the person with the user.";
    }

    return prompt;
  }

  let prompt = `Create a cinematic graduation portrait with ${params.background ?? "studio"} background. `;
  prompt += `Style: ${params.style ?? "cinematic"}. `;

  if (params.gownColor) {
    prompt += `Gown color: ${params.gownColor}. `;
  }
  if (params.capColor) {
    prompt += `Cap color: ${params.capColor}. `;
  }

  return prompt;
}