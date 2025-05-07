'use server';
/**
 * @fileOverview A movie recommendation AI agent.
 *
 * - getMovieRecommendation - A function that handles the movie recommendation process.
 * - MovieRecommendationInput - The input type for the getMovieRecommendation function.
 * - MovieRecommendationOutput - The return type for the getMovieRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MovieRecommendationInputSchema = z.object({
  userQuery: z.string().describe("User's request for a movie or series recommendation."),
});
export type MovieRecommendationInput = z.infer<typeof MovieRecommendationInputSchema>;

const MovieRecommendationOutputSchema = z.object({
  recommendationText: z.string().describe('The movie or series recommendation from the AI, including title and a brief reason.'),
});
export type MovieRecommendationOutput = z.infer<typeof MovieRecommendationOutputSchema>;

export async function getMovieRecommendation(input: MovieRecommendationInput): Promise<MovieRecommendationOutput> {
  return movieRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'movieRecommendationPrompt',
  input: {schema: MovieRecommendationInputSchema},
  output: {schema: MovieRecommendationOutputSchema},
  prompt: `You are a friendly and knowledgeable movie and series recommendation chatbot called CinéConseiller.
A user is asking for a recommendation.
User's request: {{{userQuery}}}

Please recommend a movie or series that fits their request.
Provide the title and a short (1-3 sentences) explanation of why you are recommending it.
If the request is too vague or you cannot find a suitable title, politely state that and perhaps ask for more details.
Keep your response concise, helpful, and in French.
Format your response naturally. For example: "Je vous recommande Regেন্টিনি « Le Titre du Film ». C'est un excellent choix parce que..."
If you mention a movie or series title, try to wrap it in quotes or make it bold if possible in the output text.
`,
});

const movieRecommendationFlow = ai.defineFlow(
  {
    name: 'movieRecommendationFlow',
    inputSchema: MovieRecommendationInputSchema,
    outputSchema: MovieRecommendationOutputSchema,
  },
  async (input: MovieRecommendationInput) => {
    const {output} = await prompt(input);
    if (!output) {
      return { recommendationText: "Je suis désolé, je n'ai pas pu générer de recommandation pour le moment. Veuillez réessayer." };
    }
    return output;
  }
);