import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Check } from 'lucide-react';

export function ModelCapabilities({ capabilities }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacités techniques</CardTitle>
        <CardDescription>Ce que le modèle peut faire.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {capabilities.map(cap => (
            <Badge key={cap} variant="outline" className="capitalize">
              <Check className="h-3 w-3 mr-1" /> {cap}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}