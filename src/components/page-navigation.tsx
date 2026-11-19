import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
export function PageNavigation() {
  const router = useRouter();
  return (
    <nav aria-label="Page navigation" className="mx-auto flex max-w-6xl gap-2 px-4 py-3">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          if (window.history.length > 1) router.history.back();
          else void router.navigate({ to: "/" });
        }}
      >
        <ArrowLeft />
        Back
      </Button>
      <Button size="sm" variant="ghost" asChild>
        <Link to="/">
          <Home />
          Home
        </Link>
      </Button>
    </nav>
  );
}
