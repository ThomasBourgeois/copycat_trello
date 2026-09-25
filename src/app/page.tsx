import { LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Board from "./Board";
import { deconnecter } from "./login/actions";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: taches } = await supabase
    .from("taches")
    .select("id, titre, colonne")
    .order("position");

  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <header className="flex items-center justify-between border-b bg-background px-6 py-3">
        <h1 className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="size-5 text-muted-foreground" />
          Copycat Trello
        </h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={deconnecter}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut data-icon="inline-start" />
              Se déconnecter
            </Button>
          </form>
        </div>
      </header>
      <Board taches={taches ?? []} />
    </div>
  );
}
