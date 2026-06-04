import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Check } from 'lucide-react';

export function ToolOwnFeatures({ features }) {
  if (!features || features.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fonctionnalités propres</CardTitle>
        <CardDescription>Fonctionnalités fournies par l'application elle-même.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {features.map(f => (
            <Badge key={f} variant="secondary" className="gap-1">
              <Check className="h-3 w-3" /> {f}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}