import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateSocialMediaContent({
  topic,
  tone = 'professional',
  length = 'medium',
  platforms = []
}: {
  topic: string;
  tone?: string;
  length?: string;
  platforms?: string[];
}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Platform-specific constraints
    const platformConstraints = platforms.map(platform => {
      switch (platform) {
        case 'twitter':
          return 'Twitter (280 characters max)';
        case 'facebook':
          return 'Facebook (longer posts allowed)';
        case 'instagram':
          return 'Instagram (focus on visual appeal)';
        default:
          return platform;
      }
    }).join(', ');

    const lengthGuide = {
      short: '1-2 sentences',
      medium: '2-4 sentences',
      long: '4-6 sentences'
    };

    const toneGuide = {
      professional: 'Professional and business-oriented',
      casual: 'Friendly and conversational',
      humorous: 'Light-hearted and funny',
      inspirational: 'Motivating and uplifting'
    };

    const prompt = `
Create an engaging social media post about: ${topic}

Requirements:
- Tone: ${toneGuide[tone as keyof typeof toneGuide] || tone}
- Length: ${lengthGuide[length as keyof typeof lengthGuide] || length}
- Platforms: ${platformConstraints || 'General social media'}
- Include relevant hashtags (2-5)
- Make it engaging and shareable
- Ensure it follows best practices for social media

The post should be compelling, authentic, and encourage engagement from followers.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      success: true,
      content: content.trim(),
      metadata: {
        topic,
        tone,
        length,
        platforms,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error generating content:', error);
    return {
      success: false,
      error: 'Failed to generate content. Please try again.',
      content: null
    };
  }
}

export async function improveContent(content: string, improvements: string[]) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Improve the following social media post based on these requirements:
${improvements.join(', ')}

Original post:
"${content}"

Please provide an improved version that maintains the original message while incorporating the requested improvements.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedContent = response.text();

    return {
      success: true,
      content: improvedContent.trim()
    };
  } catch (error) {
    console.error('Error improving content:', error);
    return {
      success: false,
      error: 'Failed to improve content. Please try again.',
      content: null
    };
  }
}

export async function generateHashtags(content: string, platform: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Generate relevant hashtags for this ${platform} post:
"${content}"

Requirements:
- Generate 5-10 relevant hashtags
- Mix of popular and niche hashtags
- Platform-appropriate (${platform})
- No duplicates
- Format as comma-separated list
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hashtags = response.text();

    return {
      success: true,
      hashtags: hashtags.trim().split(',').map(tag => tag.trim())
    };
  } catch (error) {
    console.error('Error generating hashtags:', error);
    return {
      success: false,
      error: 'Failed to generate hashtags',
      hashtags: []
    };
  }
}