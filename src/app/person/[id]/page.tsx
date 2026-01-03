
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPersonDetails, type Person, type PersonCreditMedia } from '@/services/tmdb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ServerCrash, User, Calendar, MapPin, Clapperboard, Tv, Star, Briefcase, Film } from 'lucide-react';

const FilmographyCard: React.FC<{ credit: PersonCreditMedia }> = ({ credit }) => (
  <Link href={`/media/${credit.mediaType}/${credit.id}`}>
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full group border border-border/60 hover:border-primary/50 bg-card rounded-xl">
      <CardHeader className="p-0 relative">
        <div className="aspect-[2/3] w-full overflow-hidden rounded-t-xl">
          <Image
            src={credit.posterUrl}
            alt={`Affiche de ${credit.title}`}
            width={300}
            height={450}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="affiche filmographie"
             onError={(e) => { e.currentTarget.src = 'https://picsum.photos/300/450?grayscale&blur=2'; }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <p className="text-md font-bold mb-1 line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
            {credit.title}
          </p>
          {(credit.character || credit.job) && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {credit.character || credit.job}
            </p>
          )}
        </div>
        <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
          {credit.releaseDate && (
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span className="font-medium">{new Date(credit.releaseDate).getFullYear()}</span>
            </div>
          )}
           <div className="flex items-center">
                <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{credit.averageRating > 0 ? credit.averageRating.toFixed(1) : 'N/A'}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);


export default function PersonDetailsPage() {
  const params = useParams();
  const personId = params.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilmography, setActiveFilmography] = useState<'acting' | 'crew'>('acting');

  useEffect(() => {
    if (!personId) {
      setError("ID de la personne manquant.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const personDetails = await getPersonDetails(personId);
        if (!personDetails) {
          setError("Impossible de trouver les détails pour cette personne.");
          setIsLoading(false);
          return;
        }
        setPerson(personDetails);
      } catch (err) {
        console.error("Erreur lors de la récupération des détails de la personne:", err);
        setError("Échec du chargement des détails. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [personId]);

  if (isLoading) {
    return <PersonDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Erreur de Chargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!person) {
    notFound();
    return null;
  }
  
  const calculateAge = (birthDate: string, deathDate: string | null): number | null => {
      if (!birthDate) return null;
      const start = new Date(birthDate);
      const end = deathDate ? new Date(deathDate) : new Date();
      let age = end.getFullYear() - start.getFullYear();
      const m = end.getMonth() - start.getMonth();
      if (m < 0 || (m === 0 && end.getDate() < start.getDate())) {
          age--;
      }
      return age;
  };

  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;
  
  const actingCredits = person.filmography.cast;
  const directingCredits = person.filmography.crew.filter(c => c.job === 'Director');
  const otherCrewCredits = person.filmography.crew.filter(c => c.job !== 'Director');


  const renderFilmography = () => {
    if (activeFilmography === 'acting') {
      return actingCredits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {actingCredits.map(credit => <FilmographyCard key={`${credit.id}-${credit.character || credit.job}`} credit={credit} />)}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">Aucun crédit d'acteur trouvé.</p>
      );
    }

    if (activeFilmography === 'crew') {
       if (person.filmography.crew.length === 0) {
         return <p className="text-muted-foreground text-center py-8">Aucun crédit d'équipe trouvé.</p>;
       }
       return (
        <div className="space-y-8">
          {directingCredits.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Réalisation ({directingCredits.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                {directingCredits.map(credit => <FilmographyCard key={`${credit.id}-${credit.job}-director`} credit={credit} />)}
              </div>
            </div>
          )}
          {otherCrewCredits.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Autre ({otherCrewCredits.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                {otherCrewCredits.map(credit => <FilmographyCard key={`${credit.id}-${credit.job}-other`} credit={credit} />)}
              </div>
            </div>
          )}
        </div>
       );
    }
    return null;
  }

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-4 xl:col-span-3">
          <Card className="overflow-hidden shadow-xl rounded-xl">
            <Image
              src={person.profileUrl}
              alt={`Photo de ${person.name}`}
              width={500}
              height={750}
              className="object-cover w-full h-auto"
              priority
              data-ai-hint="profil personne"
               onError={(e) => { e.currentTarget.src = 'https://picsum.photos/500/750?grayscale&blur=1'; }}
            />
          </Card>
        </div>

        <div className="md:col-span-8 xl:col-span-9 space-y-6">
          <div className="space-y-3">
             <Badge variant="secondary" className="text-sm capitalize !px-3 !py-1.5 shadow">
                <Briefcase className="h-4 w-4 mr-1.5 text-primary"/> {person.knownForDepartment === "Acting" ? "Acteur / Actrice" : person.knownForDepartment}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{person.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground text-sm md:text-base">
              {person.birthday && (
                <div className="flex items-center" title="Date de naissance">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>
                      {new Date(person.birthday).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {age !== null && ` (${age} ans)`}
                  </span>
                </div>
              )}
              {person.placeOfBirth && (
                <div className="flex items-center" title="Lieu de naissance">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{person.placeOfBirth}</span>
                </div>
              )}
            </div>
             {person.deathday && (
                 <div className="flex items-center text-muted-foreground text-sm md:text-base" title="Date de décès">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Décédé(e) le {new Date(person.deathday).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            )}
          </div>

           <div>
              <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <User className="text-primary h-6 w-6"/> Biographie
              </h2>
              <p className="text-foreground/80 leading-relaxed text-base whitespace-pre-wrap">
                  {person.biography || "Aucune biographie n'est disponible pour le moment."}
              </p>
           </div>
           
           {person.alsoKnownAs && person.alsoKnownAs.length > 0 && (
                <div>
                     <h3 className="text-lg font-semibold mb-2 text-foreground">Aussi connu sous</h3>
                     <div className="flex flex-wrap gap-2">
                        {person.alsoKnownAs.map(name => <Badge key={name} variant="outline">{name}</Badge>)}
                     </div>
                </div>
           )}
        </div>
      </section>

      <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Film className="text-primary h-7 w-7"/> Filmographie
            </h2>
             <Select value={activeFilmography} onValueChange={(value) => setActiveFilmography(value as 'acting' | 'crew')}>
              <SelectTrigger className="w-full sm:w-[320px] h-11 text-base">
                  <SelectValue placeholder="Sélectionnez une filmographie" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="acting">
                      <div className="flex items-center gap-2">
                          <Clapperboard className="h-4 w-4 text-muted-foreground" />
                          <span>En tant qu'acteur/actrice ({actingCredits.length})</span>
                      </div>
                  </SelectItem>
                  <SelectItem value="crew">
                      <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>En tant que membre d'équipe ({person.filmography.crew.length})</span>
                      </div>
                  </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {renderFilmography()}
      </section>

    </div>
  );
}


function PersonDetailsSkeleton() {
  return (
    <div className="space-y-12 md:space-y-16 animate-pulse">
      <section className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-4 xl:col-span-3">
          <Skeleton className="w-full aspect-[2/3] rounded-xl" />
        </div>
        <div className="md:col-span-8 xl:col-span-9 space-y-6">
          <Skeleton className="h-8 w-40 rounded-md" /> {/* Badge */}
          <Skeleton className="h-12 w-4/5 rounded-lg" /> {/* Nom */}
          <div className="space-y-3">
             <Skeleton className="h-6 w-1/2 rounded-md" />
             <Skeleton className="h-6 w-2/3 rounded-md" />
          </div>
          <div className="space-y-2 pt-4">
              <Skeleton className="h-8 w-48 mb-3 rounded-lg" /> {/* Titre Biographie */}
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-3/4 rounded" />
          </div>
        </div>
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-64 rounded-lg" /> {/* Titre Filmographie */}
          <Skeleton className="h-11 w-48 rounded-lg" /> {/* Menu déroulant */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[250px] w-full rounded-xl" />
                  <div className="space-y-2 p-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                  </div>
              </div>
          ))}
        </div>
      </section>
    </div>
  );
}

    