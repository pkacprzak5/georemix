import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { ButtonLarge } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StylisedSpan from "@/components/ui/stylised-span";

export function AboutPage() {
  const { navigateTo } = useNavigation();

  const handleGoBack = () => {
    navigateTo(moduleIdMap.INTRO, "welcome-page");
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      {/* Cards Container */}
      <div className="w-full max-w-6xl h-[calc(100%-2rem)] grid grid-cols-2 gap-8">
        {/* Project Creation Card */}
        <div>
          <Card className="h-fit bg-secondary-background gradient">
            <CardHeader>
              <CardTitle className="text-3xl font-heading">
                <StylisedSpan>O Projekcie</StylisedSpan>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed">
                <span className="font-bold">GeoRemix</span> to gra powstała w ramach współpracy Koła
                Naukowego BIT i NVIDIA, łącząca zaawansowane technologie przetwarzania obrazu z
                wykorzystaniem AI z klasyczną rozrywką znaną z gry GeoGuesser.
              </p>
              <p className="text-foreground leading-relaxed">
                PLACEHOLDERY DALEJ Projekt wykorzystuje nowoczesne technologie webowe oraz
                zaawansowane renderowanie graficzne, aby zapewnić płynne i immersyjne doświadczenie
                podczas eksploracji różnych zakątków świata.
              </p>
              <p className="text-foreground leading-relaxed">
                Gra została stworzona z myślą o łączeniu edukacji z rozrywką, pozwalając graczom na
                poznawanie nowych miejsc w interaktywny i angażujący sposób.
              </p>
            </CardContent>
          </Card>

          <ButtonLarge onClick={handleGoBack} className="w-full mt-8 ">
            Powrót do Menu Głównego
          </ButtonLarge>
        </div>

        {/* Game Rules Card */}
        {/* Has to be styled like that because of overflowing issues */}
        <Card className="h-full py-0 flex flex-col bg-secondary-background gradient overflow-hidden">
          <CardContent className="py-6 overflow-auto scrollbar-neobrutalist flex-1 min-h-0">
            <CardTitle className="text-3xl font-heading">
              <StylisedSpan>Zasady Gry</StylisedSpan>
            </CardTitle>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Przebieg rozgrywki</h3>
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
              <h3 className="text-lg font-bold text-foreground mb-2">Punktacja</h3>
              <p className="text-foreground leading-relaxed">
                Po wyborze wskazane miejsce porównywane jest z faktyczną lokalizacją.
              </p>
              <p className="text-foreground leading-relaxed mt-2">
                Im mniejsza odległość między wytypowanym punktem a rzeczywistym, tym więcej punktów
                gracz otrzymuje.
              </p>
              <p className="text-foreground leading-relaxed mt-2">
                Dodatkowym kryterium jest czas podjęcia decyzji - szybsze odpowiedzi nagradzane są
                wyższym wynikiem!
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Zakończenie rozgrywki</h3>
              <p className="text-foreground leading-relaxed">
                Po rozegraniu wszystkich 5 rund gra prezentuje końcowy wynik gracza, obliczany na
                podstawie:
              </p>
              <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 ml-4">
                <li>średniej lub łącznej odległości od właściwych miejsc,</li>
                <li>oraz czasu, jaki zajęło podjęcie decyzji w każdej rundzie.</li>
              </ul>

              <p className="text-foreground leading-relaxed mt-2">
                Celem jest uzyskanie jak największej liczby punktów, a więc trafne i szybkie
                rozpoznawanie lokalizacji. Wyniki mogą być porównywane między graczami.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
