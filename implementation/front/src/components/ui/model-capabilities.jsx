import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Check } from 'lucide-react';

export function ModelCapabilities({ capabilities }) {
  if (!capabilities || capabilities.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacités techniques</CardTitle>
        <CardDescription>Ce que le modèle peut faire.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {capabilities.map(cap => (
            <Badge key={cap} variant="outline" className="capitalize gap-1 py-1.5">
              <Check className="h-3 w-3" /> {cap}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}