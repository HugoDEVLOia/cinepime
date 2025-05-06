const API_KEY = '7f47e5a98ff4014fedea0408a8390069';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For posters and profile pictures

export interface Media {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  averageRating: number;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  runtime?: number; // in minutes for movies
  numberOfSeasons?: number; // for tv shows
}

export interface Actor {
  id: string;
  name: string;
  profileUrl: string;
  character?: string;
}

export interface Director {
  id: string;
  name: string;
  profileUrl: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  name: string;
  overview: string;
  posterUrl: string;
  airDate?: string;
  episodeCount: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  rating: number;
  stillPath?: string;
  airDate?: string;
}

const 안전하게_이미지_URL_가져오기 = (path: string | null | undefined): string => {
  if (path) {
    return `${IMAGE_BASE_URL}${path}`;
  }
  // Return a placeholder if no image is available
  return 'https://picsum.photos/500/750?grayscale';
};

const mapApiMediaToMedia = (item: any, mediaType: 'movie' | 'tv'): Media => ({
  id: item.id.toString(),
  title: item.title || item.name || 'Unknown Title',
  description: item.overview || 'No description available.',
  posterUrl: 안전하게_이미지_URL_가져오기(item.poster_path),
  averageRating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
  mediaType,
  releaseDate: item.release_date || item.first_air_date,
  runtime: item.runtime,
  numberOfSeasons: item.number_of_seasons,
});

const mapApiActorToActor = (actor: any): Actor => ({
  id: actor.id.toString(),
  name: actor.name || 'Unknown Actor',
  profileUrl: 안전하게_이미지_URL_가져오기(actor.profile_path),
  character: actor.character,
});

const mapApiDirectorToDirector = (crewMember: any): Director => ({
  id: crewMember.id.toString(),
  name: crewMember.name || 'Unknown Director',
  profileUrl: 안전하게_이미지_URL_가져오기(crewMember.profile_path),
});

export async function getTrendingMedia(): Promise<Media[]> {
  try {
    const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`);
    if (!response.ok) {
      console.error('Failed to fetch trending media:', response.status, await response.text());
      return [];
    }
    const data = await response.json();
    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => mapApiMediaToMedia(item, item.media_type as 'movie' | 'tv'));
  } catch (error) {
    console.error('Error fetching trending media:', error);
    return [];
  }
}

export async function getMediaDetails(mediaId: string, mediaType: 'movie' | 'tv'): Promise<Media | null> {
  try {
    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}?api_key=${API_KEY}&append_to_response=credits`);
    if (!response.ok) {
      console.error(`Failed to fetch ${mediaType} details:`, response.status, await response.text());
      return null;
    }
    const data = await response.json();
    return mapApiMediaToMedia(data, mediaType);
  } catch (error) {
    console.error(`Error fetching ${mediaType} details:`, error);
    return null;
  }
}

export async function getMediaActors(mediaId: string, mediaType: 'movie' | 'tv'): Promise<Actor[]> {
  try {
    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/credits?api_key=${API_KEY}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${mediaType} actors:`, response.status, await response.text());
      return [];
    }
    const data = await response.json();
    return data.cast.slice(0, 10).map(mapApiActorToActor); // Get top 10 actors
  } catch (error) {
    console.error(`Error fetching ${mediaType} actors:`, error);
    return [];
  }
}

export async function getMediaDirector(mediaId: string, mediaType: 'movie' | 'tv'): Promise<Director | null> {
  try {
    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/credits?api_key=${API_KEY}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${mediaType} director:`, response.status, await response.text());
      return null;
    }
    const data = await response.json();
    const director = data.crew.find((person: any) => person.job === 'Director');
    return director ? mapApiDirectorToDirector(director) : null;
  } catch (error) {
    console.error(`Error fetching ${mediaType} director:`, error);
    return null;
  }
}

export async function getSeriesSeasons(seriesId: string): Promise<Season[]> {
  try {
    // First, get the series details to find out how many seasons there are
    const seriesDetailsResponse = await fetch(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}`);
    if (!seriesDetailsResponse.ok) {
      console.error('Failed to fetch series details for seasons:', seriesDetailsResponse.status, await seriesDetailsResponse.text());
      return [];
    }
    const seriesData = await seriesDetailsResponse.json();
    const seasonPromises: Promise<Season | null>[] = [];

    for (let i = 1; i <= seriesData.number_of_seasons; i++) {
      seasonPromises.push(getSeasonDetails(seriesId, i));
    }
    
    const seasonsWithDetails = await Promise.all(seasonPromises);
    return seasonsWithDetails.filter(season => season !== null) as Season[];

  } catch (error) {
    console.error('Error fetching series seasons:', error);
    return [];
  }
}

async function getSeasonDetails(seriesId: string, seasonNumber: number): Promise<Season | null> {
  try {
    const response = await fetch(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`);
    if (!response.ok) {
      console.error(`Failed to fetch season ${seasonNumber} details:`, response.status, await response.text());
      return null;
    }
    const data = await response.json();
    return {
      id: data.id.toString(),
      seasonNumber: data.season_number,
      name: data.name || `Season ${data.season_number}`,
      overview: data.overview || 'No overview available.',
      posterUrl: 안전하게_이미지_URL_가져오기(data.poster_path),
      airDate: data.air_date,
      episodeCount: data.episodes?.length || 0,
      episodes: (data.episodes || []).map((ep: any): Episode => ({
        id: ep.id.toString(),
        episodeNumber: ep.episode_number,
        title: ep.name || `Episode ${ep.episode_number}`,
        description: ep.overview || 'No description available.',
        rating: ep.vote_average ? parseFloat(ep.vote_average.toFixed(1)) : 0,
        stillPath: 안전하게_이미지_URL_가져오기(ep.still_path),
        airDate: ep.air_date,
      })),
    };
  } catch (error) {
    console.error(`Error fetching details for season ${seasonNumber}:`, error);
    return null;
  }
}


export async function searchMedia(query: string): Promise<Media[]> {
  if (!query.trim()) return [];
  try {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.error('Failed to search media:', response.status, await response.text());
      return [];
    }
    const data = await response.json();
    return data.results
      .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path) // Ensure poster exists
      .map((item: any) => mapApiMediaToMedia(item, item.media_type as 'movie' | 'tv'));
  } catch (error) {
    console.error('Error searching media:', error);
    return [];
  }
}

export async function getMediaRecommendations(mediaId: string, mediaType: 'movie' | 'tv'): Promise<Media[]> {
  try {
    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/recommendations?api_key=${API_KEY}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${mediaType} recommendations:`, response.status, await response.text());
      return [];
    }
    const data = await response.json();
    return data.results
      .filter((item: any) => item.poster_path) // Ensure poster exists
      .map((item: any) => mapApiMediaToMedia(item, mediaType)); // Recommendations are of the same media type
  } catch (error) {
    console.error(`Error fetching ${mediaType} recommendations:`, error);
    return [];
  }
}
