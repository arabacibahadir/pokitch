import { ArrowLeft, Dumbbell, Ruler } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPokemonDetail } from "@/features/pokemon/queries";

type PageProps = { params: Promise<{ name: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  return { title: `${name.replaceAll("-", " ")} | Pokitch` };
}

export default async function PokemonPage({ params }: PageProps) {
  const { name } = await params;
  const pokemon = await getPokemonDetail(name);
  if (!pokemon) notFound();

  const stats = [
    ["HP", pokemon.stats.hp],
    ["Attack", pokemon.stats.attack],
    ["Defense", pokemon.stats.defense],
    ["Sp. Atk", pokemon.stats.specialAttack],
    ["Sp. Def", pokemon.stats.specialDefense],
    ["Speed", pokemon.stats.speed],
  ] as const;

  return (
    <section className="container grid gap-6 py-10 tablet:py-14">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/collections">
          <ArrowLeft className="size-4" /> Back to catches
        </Link>
      </Button>

      <div className="grid gap-6 laptop:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <Card className="game-panel overflow-hidden border-2 shadow-none">
          <CardContent className="grid min-h-[420px] place-items-center bg-[radial-gradient(circle,oklch(var(--secondary)),oklch(var(--background))_68%)] p-8">
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              width={420}
              height={420}
              priority
              className="max-h-[360px] w-auto object-contain drop-shadow-2xl"
            />
          </CardContent>
        </Card>

        <Card className="game-panel border-2 shadow-none">
          <CardHeader>
            <p className="game-kicker">
              Pokedex #{String(pokemon.id).padStart(4, "0")}
            </p>
            <CardTitle className="text-4xl font-black capitalize tablet:text-6xl">
              {pokemon.name.replaceAll("-", " ")}
            </CardTitle>
            <div className="flex flex-wrap gap-2 pt-2">
              {pokemon.types.map((type) => (
                <Badge key={type} variant="secondary" className="capitalize">
                  {type}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-3">
              <Metric
                icon={Ruler}
                label="Height"
                value={`${pokemon.heightMeters} m`}
              />
              <Metric
                icon={Dumbbell}
                label="Weight"
                value={`${pokemon.weightKilograms} kg`}
              />
            </div>

            <div>
              <p className="game-kicker mb-3">Abilities</p>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((ability) => (
                  <span
                    key={ability}
                    className="border border-border bg-muted/40 px-3 py-2 text-sm font-semibold capitalize"
                  >
                    {ability.replaceAll("-", " ")}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <p className="game-kicker">Base stats</p>
              {stats.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[72px_36px_1fr] items-center gap-3 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-right font-bold">{value}</span>
                  <div className="h-2 overflow-hidden bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min(100, (value / 180) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ruler;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border bg-muted/30 p-3">
      <Icon className="mb-2 size-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
