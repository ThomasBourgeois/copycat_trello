"use client";

import { useActionState } from "react";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authentifier } from "./actions";

export default function Login() {
  const [message, action, enCours] = useActionState(authentifier, null);

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutDashboard className="size-5 text-muted-foreground" />
            Copycat Trello
          </CardTitle>
          <CardDescription>Connecte-toi pour voir ton tableau.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                name="mode"
                value="connexion"
                disabled={enCours}
              >
                Se connecter
              </Button>
              <Button
                type="submit"
                name="mode"
                value="inscription"
                variant="outline"
                disabled={enCours}
              >
                Créer un compte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
