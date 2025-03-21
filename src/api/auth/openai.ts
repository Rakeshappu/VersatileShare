import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { prompt } = req.body;

    try {
      const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 150,
      });

      res.status(200).json({ result: completion.data.choices[0].text });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}