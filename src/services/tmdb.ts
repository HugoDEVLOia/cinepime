
const API_KEY = '7f47e5a98ff4014fedea0408a8390069';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For posters and profile pictures
const LANGUAGE = 'fr-FR';

export type TimeWindow = 'day' | 'week' | 'month' | 'year' | 'all';

export interface Video {
  id: string;
  key: string; // YouTube video ID
  name: string;
  site: string; // e.g., "YouTube"
  type: string; // e.g., "Trailer", "Teaser", "Featurette"
  official: boolean;
  iso_639_1: string; // language e.g. "en", "fr"
  iso_3166_1: string; // country e.g. "US", "FR"
  size: number; // e.g. 1080 for HD
}

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
  genres?: { id: number; name: string; }[];
  cast?: Actor[];
  videos?: Video[];
  credits?: { // Added to hold full credits response
    cast: Actor[];
    crew: any[]; // Define more specific type for crew if needed
  };
  popularity?: number; // Added for sorting discover results
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

const getSafeImageUrl = (path: string | null | undefined): string => {
  if (path) {
    return `${IMAGE_BASE_URL}${path}`;
  }
  return 'https://picsum.photos/500/750?grayscale&blur=2'; 
};

const getSafeProfileImageUrl = (path: string | null | undefined): string => {
  if (path) {
    return `${IMAGE_BASE_URL}${path}`;
  }
  return 'https://picsum.photos/100/150?grayscale'; 
};

const mapApiVideoToVideo = (video: any): Video => ({
  id: video.id,
  key: video.key,
  name: video.name,
  site: video.site,
  type: video.type,
  official: video.official,
  iso_639_1: video.iso_639_1,
  iso_3166_1: video.iso_3166_1,
  size: video.size,
});

const mapApiActorToActor = (actor: any): Actor => ({
  id: actor.id.toString(),
  name: actor.name || 'Acteur inconnu',
  profileUrl: getSafeProfileImageUrl(actor.profile_path),
  character: actor.character,
});

const mapApiMediaToMedia = (item: any, mediaType: 'movie' | 'tv'): Media => ({
  id: item.id.toString(),
  title: item.title || item.name || 'Titre inconnu',
  description: item.overview || 'Aucune description disponible.',
  posterUrl: getSafeImageUrl(item.poster_path),
  averageRating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
  mediaType,
  releaseDate: item.release_date || item.first_air_date,
  runtime: item.runtime,
  numberOfSeasons: item.number_of_seasons,
  genres: item.genres || [],
  cast: item.credits?.cast ? item.credits.cast.slice(0, 10).map(mapApiActorToActor) : (item.cast || []), // Use item.cast as fallback
  videos: item.videos?.results ? item.videos.results.map(mapApiVideoToVideo).filter((v: Video) => v.site === 'YouTube') : [],
  credits: item.credits ? { // Store full credits if available
    cast: item.credits.cast.map(mapApiActorToActor),
    crew: item.credits.crew,
   } : undefined,
  popularity: item.popularity,
});


const mapApiDirectorToDirector = (crewMember: any): Director => ({
  id: crewMember.id.toString(),
  name: crewMember.name || 'Réalisateur inconnu',
  profileUrl: getSafeProfileImageUrl(crewMember.profile_path),
});

export async function getTrendingMedia(page: number = 1, timeWindow: TimeWindow = 'week'): Promise<{ media: Media[], totalPages: number }> {
  if (timeWindow === 'day' || timeWindow === 'week') {
    try {
      const response = await fetch(`${BASE_URL}/trending/all/${timeWindow}?api_key=${API_KEY}&language=${LANGUAGE}&page=${page}`);
      if (!response.ok) {
        console.error(`Échec de la récupération des médias tendances (${timeWindow}):`, response.status, await response.text());
        return { media: [], totalPages: 1 };
      }
      const data = await response.json();
      const media = data.results
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: any) => mapApiMediaToMedia(item, item.media_type as 'movie' | 'tv'));
      return { media, totalPages: data.total_pages };
    } catch (error) {
      console.error(`Erreur lors de la récupération des médias tendances (${timeWindow}):`, error);
      return { media: [], totalPages: 1 };
    }
  } else {
    // Handle 'month', 'year', 'all' using /discover endpoint
    let movieParams = `api_key=${API_KEY}&language=${LANGUAGE}&page=${page}&sort_by=popularity.desc`;
    let tvParams = `api_key=${API_KEY}&language=${LANGUAGE}&page=${page}&sort_by=popularity.desc`;

    const today = new Date();
    const yyyy = today.getFullYear();
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    if (timeWindow === 'month') {
        const firstDayOfMonth = formatDate(new Date(yyyy, today.getMonth(), 1));
        const lastDayOfMonth = formatDate(new Date(yyyy, today.getMonth() + 1, 0));
        movieParams += `&primary_release_date.gte=${firstDayOfMonth}&primary_release_date.lte=${lastDayOfMonth}&with_release_type=2|3`; // Include theatrical limited and theatrical
        tvParams += `&first_air_date.gte=${firstDayOfMonth}&first_air_date.lte=${lastDayOfMonth}`;
    } else if (timeWindow === 'year') {
        const firstDayOfYear = formatDate(new Date(yyyy, 0, 1));
        const lastDayOfYear = formatDate(new Date(yyyy, 11, 31));
        movieParams += `&primary_release_date.gte=${firstDayOfYear}&primary_release_date.lte=${lastDayOfYear}&with_release_type=2|3`;
        tvParams += `&first_air_date.gte=${firstDayOfYear}&first_air_date.lte=${lastDayOfYear}`;
    }
    // For 'all', no date params are added to sort by overall popularity.

    try {
        const [movieResponse, tvResponse] = await Promise.all([
            fetch(`${BASE_URL}/discover/movie?${movieParams}`),
            fetch(`${BASE_URL}/discover/tv?${tvParams}`)
        ]);

        let combinedMedia: Media[] = [];
        let movieTotalPages = 0;
        let tvTotalPages = 0;

        if (movieResponse.ok) {
            const movieData = await movieResponse.json();
            combinedMedia.push(...movieData.results
                .filter((item: any) => item.poster_path) // Ensure poster exists
                .map((item: any) => mapApiMediaToMedia(item, 'movie')));
            movieTotalPages = movieData.total_pages;
        } else {
            console.warn(`Échec de la récupération des films populaires pour ${timeWindow}: ${movieResponse.status}, ${await movieResponse.text()}`);
        }

        if (tvResponse.ok) {
            const tvData = await tvResponse.json();
            combinedMedia.push(...tvData.results
                .filter((item: any) => item.poster_path) // Ensure poster exists
                .map((item: any) => mapApiMediaToMedia(item, 'tv')));
            tvTotalPages = tvData.total_pages;
        } else {
            console.warn(`Échec de la récupération des séries populaires pour ${timeWindow}: ${tvResponse.status}, ${await tvResponse.text()}`);
        }
        
        combinedMedia.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

        return { media: combinedMedia, totalPages: Math.max(movieTotalPages, tvTotalPages, 1) };

    } catch (error) {
      console.error(`Erreur lors de la récupération des médias populaires pour ${timeWindow}:`, error);
      return { media: [], totalPages: 1 };
    }
  }
}

export async function getMediaDetails(mediaId: string, mediaType: 'movie' | 'tv'): Promise<Media | null> {
  try {
    // Append credits (for cast/crew) and videos to the main media details call
    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=credits,videos`);
    if (!response.ok) {
      console.error(`Échec de la récupération des détails ${mediaType}:`, response.status, await response.text());
      return null;
    }
    const data = await response.json();
    return mapApiMediaToMedia(data, mediaType);
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails ${mediaType}:`, error);
    return null;
  }
}


// getMediaActors and getMediaDirector are no longer strictly necessary if getMediaDetails fetches credits.
// They can be kept if there's a specific use case for fetching only actors or director without other details.
// For now, we assume MediaDetailsPage will use the cast/crew from the enhanced getMediaDetails.
export async function getMediaActors(mediaId: string, mediaType: 'movie' | 'tv'): Promise<Actor[]> {
  try {
    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/credits?api_key=${API_KEY}&language=${LANGUAGE}`);
    if (!response.ok) {
      console.error(`Échec de la récupération des acteurs ${mediaType}:`, response.status, await response.text());
      return [];
    }
    const data = await response.json();
    return data.cast.slice(0, 10).map(mapApiActorToActor); 
  } catch (error) {
    console.error(`Erreur lors de la récupération des acteurs ${mediaType}:`, error);
    return [];
  }
}

export async function getMediaDirector(mediaId: string, mediaType: 'movie' | 'tv'): Promise<Director | null> {
  try {
    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/credits?api_key=${API_KEY}&language=${LANGUAGE}`);
    if (!response.ok) {
      console.error(`Échec de la récupération du réalisateur ${mediaType}:`, response.status, await response.text());
      return null;
    }
    const data = await response.json();
    const director = data.crew.find((person: any) => person.job === 'Director');
    return director ? mapApiDirectorToDirector(director) : null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du réalisateur ${mediaType}:`, error);
    return null;
  }
}


export async function getSeriesSeasons(seriesId: string): Promise<Season[]> {
  try {
    const seriesDetailsResponse = await fetch(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}&language=${LANGUAGE}`);
    if (!seriesDetailsResponse.ok) {
      console.error('Échec de la récupération des détails de la série pour les saisons:', seriesDetailsResponse.status, await seriesDetailsResponse.text());
      return [];
    }
    const seriesData = await seriesDetailsResponse.json();
    const seasonPromises: Promise<Season | null>[] = [];

    for (let i = 1; i <= seriesData.number_of_seasons; i++) {
      // Fetch details only for seasons that have an air_date (are released) or are special seasons (season_number 0)
      const seasonInfo = seriesData.seasons.find((s: any) => s.season_number === i);
      if (seasonInfo && (seasonInfo.air_date || seasonInfo.season_number === 0) && seasonInfo.episode_count > 0) {
         seasonPromises.push(getSeasonDetails(seriesId, i));
      } else if (!seasonInfo || seasonInfo.episode_count === 0) {
        // If season info is missing or has 0 episodes, create a placeholder or skip
        // For now, let's skip unreleased or empty seasons from detailed fetching to avoid errors / empty data
         console.log(`Skipping season ${i} for series ${seriesId} due to no air date, missing info or 0 episodes.`);
      }
    }
    
    const seasonsWithDetails = await Promise.all(seasonPromises);
    // Filter out nulls and seasons without episodes, then sort
    return seasonsWithDetails
        .filter(season => season !== null && season.episodes.length > 0)
        .sort((a, b) => (a as Season).seasonNumber - (b as Season).seasonNumber) as Season[];


  } catch (error) {
    console.error('Erreur lors de la récupération des saisons de la série:', error);
    return [];
  }
}

async function getSeasonDetails(seriesId: string, seasonNumber: number): Promise<Season | null> {
  try {
    const response = await fetch(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=${LANGUAGE}`);
    if (!response.ok) {
      console.error(`Échec de la récupération des détails de la saison ${seasonNumber}:`, response.status, await response.text());
      return null;
    }
    const data = await response.json();
     if (!data.episodes || data.episodes.length === 0) {
      // Return a minimal season object if there are no episodes, or null to filter it out later
      // This helps avoid errors if a season is listed but has no episode data yet.
      return {
        id: data.id?.toString() || `${seriesId}-s${seasonNumber}`,
        seasonNumber: data.season_number,
        name: data.name || `Saison ${data.season_number}`,
        overview: data.overview || '',
        posterUrl: getSafeImageUrl(data.poster_path),
        airDate: data.air_date,
        episodeCount: 0,
        episodes: [],
      };
    }
    return {
      id: data.id.toString(),
      seasonNumber: data.season_number,
      name: data.name || `Saison ${data.season_number}`,
      overview: data.overview || 'Aucun résumé disponible.',
      posterUrl: getSafeImageUrl(data.poster_path),
      airDate: data.air_date,
      episodeCount: data.episodes?.length || 0,
      episodes: (data.episodes || []).map((ep: any): Episode => ({
        id: ep.id.toString(),
        episodeNumber: ep.episode_number,
        title: ep.name || `Épisode ${ep.episode_number}`,
        description: ep.overview || 'Aucune description disponible.',
        rating: ep.vote_average ? parseFloat(ep.vote_average.toFixed(1)) : 0,
        stillPath: getSafeImageUrl(ep.still_path), // Use specific still image for episode
        airDate: ep.air_date,
      })),
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails de la saison ${seasonNumber}:`, error);
    return null;
  }
}


export async function searchMedia(query: string): Promise<Media[]> {
  if (!query.trim()) return [];
  try {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=${LANGUAGE}&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.error('Échec de la recherche de médias:', response.status, await response.text());
      return [];
    }
    const data = await response.json();
    return data.results
      .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path) 
      .map((item: any) => mapApiMediaToMedia(item, item.media_type as 'movie' | 'tv'));
  } catch (error) {
    console.error('Erreur lors de la recherche de médias:', error);
    return [];
  }
}

export async function getMediaRecommendations(mediaId: string, mediaType: 'movie' | 'tv'): Promise<Media[]> {
  try {
    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/recommendations?api_key=${API_KEY}&language=${LANGUAGE}`);
    if (!response.ok) {
      console.error(`Échec de la récupération des recommandations ${mediaType}:`, response.status, await response.text());
      return [];
    }
    const data = await response.json();
    return data.results
      .filter((item: any) => item.poster_path) 
      .map((item: any) => mapApiMediaToMedia(item, mediaType === 'movie' ? 'movie' : 'tv' )); // Ensure correct mediaType is passed
  } catch (error) {
    console.error(`Erreur lors de la récupération des recommandations ${mediaType}:`, error);
    return [];
  }
}
