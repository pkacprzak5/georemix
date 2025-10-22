import { Earth } from "lucide-react";
import { useNavigation } from "@/lib/navigation/navigation-provider";
import { moduleIdMap } from "@/types/navigation";
import { ButtonLarge } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StylisedSpan from "@/components/ui/stylised-span";

export function AboutPage() {
  const { navigateTo } = useNavigation();

  const handleGoBack = () => {
    navigateTo(moduleIdMap.INTRO, "welcome-page");
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 3xl:p-6 4xl:p-8 5xl:p-10">
      {/* Cards Container */}
      <div className="w-full max-w-6xl 3xl:max-w-7xl 4xl:max-w-[90rem] 5xl:max-w-[110rem] h-[calc(100%-2rem)] grid grid-cols-2 gap-8 3xl:gap-10 4xl:gap-12 5xl:gap-16">
        {/* Project Creation Card */}
        <div>
          <Card className="h-fit bg-secondary-background gradient py-6 3xl:py-8 4xl:py-10 5xl:py-12 overflow-auto scrollbar-neobrutalist flex-1 min-h-0 3xl:text-lg 4xl:text-xl 5xl:text-2xl">
            <CardHeader>
              <CardTitle className="text-3xl 3xl:text-4xl 4xl:text-5xl 5xl:text-6xl font-heading">
                <StylisedSpan>O Projekcie</StylisedSpan>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 3xl:space-y-5 4xl:space-y-6 5xl:space-y-8 3xl:text-lg 4xl:text-xl 5xl:text-2xl">
              <p className="text-foreground leading-relaxed">
                <span className="font-bold">GeoRemix</span> to gra powstała w ramach współpracy Koła
                Naukowego BIT i NVIDIA, łącząca zaawansowane technologie przetwarzania obrazu z
                wykorzystaniem AI z klasyczną rozrywką znaną z gry GeoGuessr.
              </p>
              <p className="text-foreground leading-relaxed">
                Wykorzystane w rozgrywce lokalizacje zostały przetworzone za pomocą dedykowanego
                pipeline'u zbudowanego w oparciu o narzędzie ComfyUI. Obejmował on nie tylko sam
                model generatywny, lecz również węzły odpowiedzialne za ekstrakcję cech obrazu -
                takich jak krawędzie czy głębia - co pozwoliło uzyskać spójny wizualnie efekt
                końcowy.
              </p>
              <p className="text-foreground leading-relaxed">
                Sama platforma do gry została w całości zaprojektowana i zbudowana od podstaw przez
                członków koła, począwszy od logiki funkcjonowania do opracowania stylu wizualnego.
                Do wykonania aplikacji posłużyły nowoczesne technologie webowe, pozwalające cieszyć
                się efektami projektu w dowolnej przeglądarce.
              </p>
            </CardContent>
          </Card>

          <ButtonLarge
            onClick={handleGoBack}
            className="w-full mt-8 3xl:mt-10 4xl:mt-12 5xl:mt-16 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6">
            Powrót do Menu
            <Earth className="w-6 h-6 3xl:w-7 3xl:h-7 4xl:w-10 4xl:h-10 mt-1 3xl:mt-2" />
          </ButtonLarge>
        </div>

        {/* Game Rules Card */}
        {/* Has to be styled like that because of overflowing issues */}
        {/* Still not perfect, but can do */}
        <Card className="h-fit max-h-full py-0 flex flex-col bg-secondary-background gradient overflow-hidden">
          <CardContent className="py-6 3xl:py-8 4xl:py-10 5xl:py-12 overflow-auto scrollbar-neobrutalist flex-1 min-h-0 3xl:text-lg 4xl:text-xl 5xl:text-2xl">
            <CardTitle className="text-3xl 3xl:text-4xl 4xl:text-5xl 5xl:text-6xl font-heading">
              <StylisedSpan>Zasady Gry</StylisedSpan>
            </CardTitle>
            <div>
              <h3 className="text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl font-bold text-foreground mb-2 mt-6">
                Przebieg rozgrywki
              </h3>
              <p className="text-foreground leading-relaxed mt-2">
                Rozgrywka składa się z 5 rund, z których każda odbywa się w innej lokalizacji oraz w
                odmiennym stylu wizualnym.
              </p>

              <p className="text-foreground leading-relaxed mt-2">
                W każdej rundzie gracz ogląda widok w trybie StreetView i jego zadaniem jest
                odgadnięcie miejsca, w którym się znajduje i zaznaczenie go na mapie.
              </p>
            </div>

            <div>
              <h3 className="text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl font-bold text-foreground mb-2 mt-6">
                Punktacja
              </h3>
              <p className="text-foreground leading-relaxed">
                Po wyborze, wskazane miejsce porównywane jest z faktyczną lokalizacją.
              </p>
              <p className="text-foreground leading-relaxed mt-2">
                Im mniejsza odległość między wytypowanym punktem a rzeczywistym, tym więcej punktów
                gracz otrzymuje.
              </p>
            </div>
            <div>
              <h3 className="text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl font-bold text-foreground mb-2 mt-6">
                Zakończenie rozgrywki
              </h3>
              <p className="text-foreground leading-relaxed">
                Po rozegraniu wszystkich 5 rund gra prezentuje końcowy wynik gracza, obliczany na
                podstawie wyników w poszczególnych rundach.
              </p>

              <p className="text-foreground leading-relaxed mt-2">
                Celem jest uzyskanie jak największej liczby punktów, a więc, przede wszystkim,
                wprawne oko i trafne rozpoznawanie lokalizacji. Powodzenia!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
