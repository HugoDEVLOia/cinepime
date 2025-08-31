
'use server';
/**
 * @fileOverview A movie recommendation AI agent that uses a quiz to provide recommendations.
 *
 * - movieQuizFlow - A function that handles the movie recommendation quiz process.
 * - MovieQuizInput - The input type for the movieQuizFlow function.
 * - MovieQuizOutput - The return type for the movieQuizFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the structure for a single message in the chat history
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const MovieQuizInputSchema = z.object({
  messages: z.array(MessageSchema).describe('The history of the conversation so far.'),
});
export type MovieQuizInput = z.infer<typeof MovieQuizInputSchema>;

const MovieQuizOutputSchema = z.object({
  response: z.string().describe('The next message from the chatbot to the user.'),
});
export type MovieQuizOutput = z.infer<typeof MovieQuizOutputSchema>;

export async function movieQuizFlow(input: MovieQuizInput): Promise<MovieQuizOutput> {
  const prompt = `You are CinéConseiller, a friendly and expert movie recommendation chatbot. Your goal is to help users find the perfect movie or series by conducting a short and engaging quiz.

Follow these steps:
1.  Start by greeting the user and explaining you will ask a few questions to find the best recommendation.
2.  Ask one question at a time. The questions should be about their preferences: genre, mood (e.g., funny, serious, thrilling), themes, actors, directors, release period, etc.
3.  Keep the quiz short and fun, about 5 to 7 questions is ideal.
4.  Analyze the user's answers from the entire conversation history.
5.  Once you have enough information, provide a top 3 list of movie or series recommendations.
6.  For each recommendation, provide the title (in bold or surrounded by quotes), the year, and a short (1-2 sentences) justification explaining why it matches the user's preferences based on their answers.
7.  All your responses MUST be in French.
8.  Maintain a friendly, conversational, and helpful tone throughout.

Conversation History:
{{#each messages}}
{{role}}: {{content}}
{{/each}}

Your next response:
`;

  const {output} = await ai.generate({
    prompt,
    input: input,
    output: {
      schema: MovieQuizOutputSchema,
    },
    model: 'googleai/gemini-2.0-flash', // Use a powerful model for conversation
    config: {
      temperature: 0.8, // A bit of creativity in questions and recommendations
    },
  });

  if (!output) {
    return { response: "Je suis désolé, je n'ai pas pu générer de réponse pour le moment. Veuillez réessayer." };
  }
  return output;
}
