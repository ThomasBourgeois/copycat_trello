"use client";

import { Fragment, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const titresColonnes = ["À faire", "En cours", "Terminé"];

type Tache = { id: number; titre: string };
type Colonne = { titre: string; taches: Tache[] };

export default function Board({
  taches,
}: {
  taches: (Tache & { colonne: string })[];
}) {
  const [colonnes, setColonnes] = useState<Colonne[]>(() =>
    titresColonnes.map((titre) => ({
      titre,
      taches: taches
        .filter((t) => t.colonne === titre)
        .map(({ id, titre }) => ({ id, titre })),
    })),
  );
  // Où la tâche va atterrir : dans quelle colonne, et avant quelle tâche (null = en bas)
  const [survol, setSurvol] = useState<{
    colonne: string;
    avant: number | null;
  } | null>(null);

  function survoler(colonne: string, avant: number | null) {
    if (survol?.colonne !== colonne || survol.avant !== avant) {
      setSurvol({ colonne, avant });
    }
  }

  function deplacer(id: number, destination: string, avant: number | null) {
    if (id === avant) return;
    const tache = colonnes
      .flatMap((c) => c.taches)
      .find((t) => t.id === id);
    if (!tache) return;

    const nouvelles = colonnes.map((colonne) => {
      const taches = colonne.taches.filter((t) => t.id !== id);
      if (colonne.titre === destination) {
        const index =
          avant === null ? -1 : taches.findIndex((t) => t.id === avant);
        if (index === -1) taches.push(tache);
        else taches.splice(index, 0, tache);
      }
      return { ...colonne, taches };
    });
    setColonnes(nouvelles);
    enregistrerPositions(nouvelles);
  }

  // Enregistre la colonne et la position de chaque tâche qui a bougé
  async function enregistrerPositions(nouvelles: Colonne[]) {
    const avant = new Map(
      colonnes.flatMap((c) =>
        c.taches.map((t, i) => [t.id, `${c.titre}/${i}`] as const),
      ),
    );
    const supabase = createClient();
    const requetes = nouvelles.flatMap((c) =>
      c.taches
        .map((t, position) => ({ t, position }))
        .filter(({ t, position }) => avant.get(t.id) !== `${c.titre}/${position}`)
        .map(({ t, position }) =>
          supabase
            .from("taches")
            .update({ colonne: c.titre, position })
            .eq("id", t.id),
        ),
    );
    for (const { error } of await Promise.all(requetes)) {
      if (error) console.error(error);
    }
  }

  async function ajouter(colonne: string, titre: string) {
    const position =
      colonnes.find((c) => c.titre === colonne)?.taches.length ?? 0;
    const { data, error } = await createClient()
      .from("taches")
      .insert({ titre, colonne, position })
      .select("id, titre")
      .single();
    if (error) return console.error(error);
    setColonnes((colonnes) =>
      colonnes.map((c) =>
        c.titre === colonne ? { ...c, taches: [...c.taches, data] } : c,
      ),
    );
  }

  const indicateur = (
    <li aria-hidden className="h-0.5 rounded-full bg-primary" />
  );

  return (
    <main className="flex flex-1 items-start gap-4 overflow-x-auto p-6">
      {colonnes.map((colonne) => (
        <section
          key={colonne.titre}
          onDragOver={(e) => {
            e.preventDefault();
            survoler(colonne.titre, null);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              setSurvol(null);
          }}
          onDrop={(e) => {
            deplacer(
              Number(e.dataTransfer.getData("text/plain")),
              colonne.titre,
              null,
            );
            setSurvol(null);
          }}
          className={`w-72 shrink-0 rounded-xl border p-3 transition-colors ${
            survol?.colonne === colonne.titre ? "bg-muted" : "bg-card"
          }`}
        >
          <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">
            {colonne.titre}
            <Badge variant="secondary">{colonne.taches.length}</Badge>
          </h2>
          <ul className="flex min-h-10 flex-col gap-2">
            {colonne.taches.map((tache, i) => (
              <Fragment key={tache.id}>
                {survol?.colonne === colonne.titre &&
                  survol.avant === tache.id &&
                  indicateur}
                <li
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", String(tache.id))
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Moitié haute de la carte : on insère avant elle, moitié basse : après
                    const { top, height } =
                      e.currentTarget.getBoundingClientRect();
                    const apres = e.clientY > top + height / 2;
                    survoler(
                      colonne.titre,
                      apres ? (colonne.taches[i + 1]?.id ?? null) : tache.id,
                    );
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    if (survol)
                      deplacer(
                        Number(e.dataTransfer.getData("text/plain")),
                        survol.colonne,
                        survol.avant,
                      );
                    setSurvol(null);
                  }}
                  className="cursor-grab rounded-lg border bg-background px-3 py-2 text-sm shadow-xs transition-shadow hover:shadow-sm active:cursor-grabbing"
                >
                  {tache.titre}
                </li>
              </Fragment>
            ))}
            {survol?.colonne === colonne.titre &&
              survol.avant === null &&
              indicateur}
          </ul>
          <form
            className="relative mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              const champ = e.currentTarget.elements.namedItem(
                "titre",
              ) as HTMLInputElement;
              const titre = champ.value.trim();
              if (titre) ajouter(colonne.titre, titre);
              champ.value = "";
            }}
          >
            <Plus className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="titre"
              placeholder="Ajouter une tâche"
              className="border-transparent bg-transparent pl-8 shadow-none hover:bg-muted focus-visible:bg-background"
            />
          </form>
        </section>
      ))}
    </main>
  );
}
