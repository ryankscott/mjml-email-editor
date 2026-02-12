import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BrandSettingsPanel from "@/components/editor/BrandSettingsPanel";
import { useBrand } from "@/components/editor/BrandProvider";
import AppPageShell from "@/shared/layout/AppPageShell";

export const Route = createFileRoute("/brand")({
  component: BrandPage,
});

export function BrandPage() {
  const { createDefaultBrand } = useBrand();

  return (
    <AppPageShell
      actions={
        <Button variant="pillNeutral" size="pill" onClick={() => void createDefaultBrand()}>
          New brand
        </Button>
      }
    >
      <Card className="p-6">
        <BrandSettingsPanel />
      </Card>
    </AppPageShell>
  );
}
