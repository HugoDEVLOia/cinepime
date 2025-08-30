
const API_KEY = '7f47e5a98ff4014fedea0408a8390069';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For posters and profile pictures
const BACKDROP_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'; // For backdrop images
const LANGUAGE = 'fr-FR';

export type TimeWindow = 'day' | 'week' | 'month' | 'year';
export type MediaType = 'movie' | 'tv';

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

export interface ProviderDetail {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface CountryProviderDetails {
  link?: string;
  flatrate?: ProviderDetail[];
  rent?: ProviderDetail[];
  buy?: ProviderDetail[];
  ads?: ProviderDetail[];
  free?: ProviderDetail[];
}

export interface WatchProvidersResults {
  [countryCode: string]: CountryProviderDetails;
}

export interface Media {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  averageRating: number;
  mediaType: MediaType;
  releaseDate?: string;
  runtime?: number; // in minutes for movies
  numberOfSeasons?: number; // for tv shows
  genres?: { id: number; name: string; }[];
  cast?: Actor[];
  videos?: Video[];
  credits?: { 
    cast: Actor[];
    crew: any[]; 
  };
  watchProviders?: WatchProvidersResults;
  popularity?: number;
  contentRating?: string; // PEGI/Certification rating
}

// Minimal media type for credits list
export interface PersonCreditMedia {
  id: string;
  title: string;
  posterUrl: string;
  mediaType: 'movie' | 'tv';
  character?: string; // For acting credits
  job?: string; // For crew credits
  releaseDate?: string;
  averageRating: number;
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

export interface Person {
    id: string;
    name: string;
    biography: string;
    profileUrl: string;
    birthday: string | null;
    deathday: string | null;
    placeOfBirth: string | null;
    knownForDepartment: string; // "Acting", "Directing", etc.
    alsoKnownAs: string[];
    filmography: {
        cast: PersonCreditMedia[];
        crew: PersonCreditMedia[];
    }
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

const getSafeImageUrl = (path: string | null | undefined, size: 'w500' | 'original' = 'w500'): string => {
  if (path) {
    const baseUrl = size === 'original' ? BACKDROP_IMAGE_BASE_URL : IMAGE_BASE_URL;
    return `${baseUrl}${path}`;
  }
  return size === 'original' ? 'https://picsum.photos/1280/720?grayscale&blur=2' : 'https://picsum.photos/500/750?grayscale&blur=2'; 
};

const getSafeProfileImageUrl = (path: string | null | undefined): string => {
  if (path) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }
  return 'https://picsum.photos/500/750?grayscale'; 
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

const mapApiMediaToMedia = (item: any, mediaType: 'movie' | 'tv'): Media => {
  let contentRating: string | undefined = undefined;

  if (mediaType === 'movie' && item.release_dates && item.release_dates.results) {
    const frReleaseInfo = item.release_dates.results.find((r: any) => r.iso_3166_1 === 'FR');
    if (frReleaseInfo && frReleaseInfo.release_dates && frReleaseInfo.release_dates.length > 0) {
      const validCertifications = frReleaseInfo.release_dates
        .filter((rd: any) => rd.certification && rd.certification.trim() !== "")
        .sort((a: any, b: any) => {
          const typePriority = (type: number) => (type === 3 ? 1 : type === 4 ? 2 : 3); // Prioritize Theatrical, then Digital
          return typePriority(a.type) - typePriority(b.type);
        });
      if (validCertifications.length > 0) {
        contentRating = validCertifications[0].certification;
      }
    }
  } else if (mediaType === 'tv' && item.content_ratings && item.content_ratings.results) {
    const frRatingInfo = item.content_ratings.results.find((r: any) => r.iso_3166_1 === 'FR');
    if (frRatingInfo && frRatingInfo.rating && frRatingInfo.rating.trim() !== '') {
      contentRating = frRatingInfo.rating;
    }
  }
  
  // Standardize "Tous publics"
  if (contentRating === 'U') contentRating = 'TP';


  return {
    id: item.id.toString(),
    title: item.title || item.name || 'Titre inconnu',
    description: item.overview || 'Aucune description disponible.',
    posterUrl: getSafeImageUrl(item.poster_path),
    backdropUrl: getSafeImageUrl(item.backdrop_path, 'original'),
    averageRating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
    mediaType,
    releaseDate: item.release_date || item.first_air_date,
    runtime: item.runtime,
    numberOfSeasons: item.number_of_seasons,
    genres: item.genres || [],
    cast: item.credits?.cast ? item.credits.cast.slice(0, 10).map(mapApiActorToActor) : (item.cast || []),
    videos: item.videos?.results ? item.videos.results.map(mapApiVideoToVideo).filter((v: Video) => v.site === 'YouTube') : [],
    credits: item.credits ? {
      cast: item.credits.cast.map(mapApiActorToActor),
      crew: item.credits.crew,
    } : undefined,
    watchProviders: item['watch/providers']?.results,
    popularity: item.popularity,
    contentRating: contentRating,
  };
};


const mapApiDirectorToDirector = (crewMember: any): Director => ({
  id: crewMember.id.toString(),
  name: crewMember.name || 'Réalisateur inconnu',
  profileUrl: getSafeProfileImageUrl(crewMember.profile_path),
});

export async function getPopularMedia(mediaType: MediaType, page: number = 1): Promise<{ media: Media[], totalPages: number }> {
  try {
    const response = await fetch(`${BASE_URL}/${mediaType}/popular?api_key=${API_KEY}&language=${LANGUAGE}&page=${page}`);
    if (!response.ok) {
      console.error(`Failed to fetch popular ${mediaType}:`, response.status, await response.text());
      return { media: [], totalPages: 1 };
    }
    const data = await response.json();
    const media = data.results
      .filter((item: any) => item.poster_path)
      .map((item: any) => mapApiMediaToMedia(item, mediaType));
    return { media, totalPages: data.total_pages };
  } catch (error) {
    console.error(`Error fetching popular ${mediaType}:`, error);
    return { media: [], totalPages: 1 };
  }
}


export async function getTrendingMedia(page: number = 1, timeWindow: Exclude<TimeWindow, 'all'> = 'week'): Promise<{ media: Media[], totalPages: number }> {
  if (timeWindow === 'day' || timeWindow === 'week') {
    try {
      const response = await fetch(`${BASE_URL}/trending/all/${timeWindow}?api_key=${API_KEY}&language=${LANGUAGE}&page=${page}`);
      if (!response.ok) {
        console.error(`Échec de la récupération des médias tendances (${timeWindow}):`, response.status, await response.text());
        return { media: [], totalPages: 1 };
      }
      const data = await response.json();
      const media = data.results
        .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path && item.backdrop_path)
        .map((item: any) => mapApiMediaToMedia(item, item.media_type as 'movie' | 'tv'));
      return { media, totalPages: data.total_pages };
    } catch (error) {
      console.error(`Erreur lors de la récupération des médias tendances (${timeWindow}):`, error);
      return { media: [], totalPages: 1 };
    }
  } else {
    let movieParams = `api_key=${API_KEY}&language=${LANGUAGE}&page=${page}&sort_by=popularity.desc`;
    let tvParams = `api_key=${API_KEY}&language=${LANGUAGE}&page=${page}&sort_by=popularity.desc`;

    const today = new Date();
    const yyyy = today.getFullYear();
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    if (timeWindow === 'month') {
        const firstDayOfMonth = formatDate(new Date(yyyy, today.getMonth(), 1));
        const lastDayOfMonth = formatDate(new Date(yyyy, today.getMonth() + 1, 0));
        movieParams += `&primary_release_date.gte=${firstDayOfMonth}&primary_release_date.lte=${lastDayOfMonth}&with_release_type=2|3`;
        tvParams += `&first_air_date.gte=${firstDayOfMonth}&first_air_date.lte=${lastDayOfMonth}`;
    } else if (timeWindow === 'year') {
        const firstDayOfYear = formatDate(new Date(yyyy, 0, 1));
        const lastDayOfYear = formatDate(new Date(yyyy, 11, 31));
        movieParams += `&primary_release_date.gte=${firstDayOfYear}&primary_release_date.lte=${lastDayOfYear}&with_release_type=2|3`;
        tvParams += `&first_air_date.gte=${firstDayOfYear}&first_air_date.lte=${lastDayOfYear}`;
    }

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
                .filter((item: any) => item.poster_path) 
                .map((item: any) => mapApiMediaToMedia(item, 'movie')));
            movieTotalPages = movieData.total_pages;
        } else {
            console.warn(`Échec de la récupération des films populaires pour ${timeWindow}: ${movieResponse.status}, ${await movieResponse.text()}`);
        }

        if (tvResponse.ok) {
            const tvData = await tvResponse.json();
            combinedMedia.push(...tvData.results
                .filter((item: any) => item.poster_path) 
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
    // Added release_dates for movies and content_ratings for TV for certification info
    const appendToResponse = 'credits,videos,watch/providers' +
                             (mediaType === 'movie' ? ',release_dates' : '') +
                             (mediaType === 'tv' ? ',content_ratings' : '');

    const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=${appendToResponse}`);
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

    for (let i = 0; i <= seriesData.number_of_seasons; i++) { // Include season 0 for specials
      const seasonInfo = seriesData.seasons.find((s: any) => s.season_number === i);
      if (seasonInfo && (seasonInfo.air_date || seasonInfo.season_number === 0) && seasonInfo.episode_count > 0) {
         seasonPromises.push(getSeasonDetails(seriesId, i));
      } else if (!seasonInfo || seasonInfo.episode_count === 0) {
         console.log(`Saison ${i} pour la série ${seriesId} ignorée car pas de date de diffusion, informations manquantes ou 0 épisodes.`);
      }
    }
    
    const seasonsWithDetails = await Promise.all(seasonPromises);
    return seasonsWithDetails
        .filter(season => season !== null && season.episodes.length > 0)
        .sort((a, b) => ((a as Season).seasonNumber === 0 ? -1 : (a as Season).seasonNumber) - ((b as Season).seasonNumber === 0 ? -1 : (b as Season).seasonNumber)) as Season[];


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
        stillPath: getSafeImageUrl(ep.still_path), 
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
      .map((item: any) => mapApiMediaToMedia(item, mediaType )); 
  } catch (error) {
    console.error(`Erreur lors de la récupération des recommandations ${mediaType}:`, error);
    return [];
  }
}

const mapApiCreditToPersonCreditMedia = (credit: any): PersonCreditMedia => {
    const mediaType = credit.media_type === 'movie' ? 'movie' : 'tv';
    return {
        id: credit.id.toString(),
        title: credit.title || credit.name || 'Titre inconnu',
        posterUrl: getSafeImageUrl(credit.poster_path),
        mediaType: mediaType,
        character: credit.character,
        job: credit.job,
        releaseDate: credit.release_date || credit.first_air_date,
        averageRating: credit.vote_average ? parseFloat(credit.vote_average.toFixed(1)) : 0,
    };
};

export async function getPersonDetails(personId: string): Promise<Person | null> {
    try {
        const appendToResponse = 'combined_credits';
        const response = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=${appendToResponse}`);
        
        if (!response.ok) {
            console.error(`Échec de la récupération des détails de la personne:`, response.status, await response.text());
            return null;
        }
        
        const data = await response.json();

        // Process credits
        const filmography = {
            cast: data.combined_credits.cast
                .filter((c: any) => (c.media_type === 'movie' || c.media_type === 'tv') && c.poster_path)
                .map(mapApiCreditToPersonCreditMedia),
            crew: data.combined_credits.crew
                .filter((c: any) => (c.media_type === 'movie' || c.media_type === 'tv') && c.poster_path)
                .map(mapApiCreditToPersonCreditMedia)
        };

        // Remove duplicates and sort by date
        const uniqueCast = Array.from(new Map(filmography.cast.map(item => [item.id, item])).values())
            .sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime());
        
        const uniqueCrew = Array.from(new Map(filmography.crew.map(item => [item.id, item])).values())
            .sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime());

        return {
            id: data.id.toString(),
            name: data.name,
            biography: data.biography || "Aucune biographie disponible.",
            profileUrl: getSafeProfileImageUrl(data.profile_path),
            birthday: data.birthday,
            deathday: data.deathday,
            placeOfBirth: data.place_of_birth,
            knownForDepartment: data.known_for_department,
            alsoKnownAs: data.also_known_as,
            filmography: {
                cast: uniqueCast,
                crew: uniqueCrew,
            }
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de la personne:', error);
        return null;
    }
}
