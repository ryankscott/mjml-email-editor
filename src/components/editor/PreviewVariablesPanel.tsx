import {
  SUPPORTED_VARIABLES,
  SUPPORTED_VARIABLES_BY_KEY,
  formatVariableToken,
} from "@/lib/variables";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PreviewVariablesPanelProps = {
  variables: string[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onRandomize: (key: string) => void;
};

export default function PreviewVariablesPanel({
  variables,
  values,
  onChange,
  onRandomize,
}: PreviewVariablesPanelProps) {
  const supportedOrder = SUPPORTED_VARIABLES.map((variable) => variable.key);
  const supportedSet = new Set(supportedOrder);
  const variableSet = new Set(variables);

  const orderedVariables = [
    ...supportedOrder.filter((key) => variableSet.has(key)),
    ...variables
      .filter((key) => !supportedSet.has(key))
      .sort((a, b) => a.localeCompare(b)),
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Variables</h2>
        <p className="text-xs text-slate-500">
          Edit preview values for detected tokens.
        </p>
      </div>

      {orderedVariables.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No variables detected in this template.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orderedVariables.map((key) => {
            const meta = SUPPORTED_VARIABLES_BY_KEY[key];
            const label = meta?.label ?? key;
            const description = meta?.description;
            const token = formatVariableToken(key);
            return (
              <Card key={key} className="rounded-xl p-0 shadow-none">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      {description ? (
                        <p className="text-xs text-slate-500">{description}</p>
                      ) : (
                        <p className="text-[11px] font-mono text-slate-400">{token}</p>
                      )}
                    </div>
                    <Button
                      variant="pillNeutral"
                      size="sm"
                      onClick={() => onRandomize(key)}
                    >
                      Randomize
                    </Button>
                  </div>
                  <Input
                    value={values[key] ?? ""}
                    onChange={(event) => onChange(key, event.target.value)}
                    className="mt-3"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
