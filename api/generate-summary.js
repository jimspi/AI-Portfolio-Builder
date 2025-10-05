import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { name, title, bio, projects } = req.body;

  const prompt = `You are analyzing an AI portfolio. Create a compelling 2-3 sentence summary that highlights the person's expertise, the breadth of their work, and key achievements.

Portfolio Owner: ${name}
Title: ${title}
Bio: ${bio}

Projects:
${projects.map((p, i) => `${i + 1}. ${p.name} - ${p.description} (Use Case: ${p.useCase}, Tools: ${p.tools})`).join('\n')}

Write a professional, impressive summary that would make someone want to learn more. Focus on impact, innovation, and expertise. Keep it under 50 words.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional portfolio writer who creates compelling summaries of AI practitioners and their work.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const summary = completion.choices[0].message.content.trim();

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
