import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Check } from 'lucide-react';

export function PricingPlansSection({ plans, type = 'tool' }) {
  if (!plans || plans.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans tarifaires</CardTitle>
        <CardDescription>
          {type === 'tool' ? "L'outil" : "Le modèle"} propose différents niveaux d'abonnement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <Card key={idx} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground"> / {plan.period === 'month' ? 'mois' : 'an'}</span>
                </div>
                {plan.description && <CardDescription>{plan.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {plan.availableModels && plan.availableModels.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Modèles accessibles</h4>
                    <div className="space-y-3">
                      {plan.availableModels.map(model => (
                        <div key={model.modelId} className="border rounded-lg p-2 text-sm">
                          <p className="font-medium">{model.modelId}</p>
                          {model.limits && <p className="text-xs text-muted-foreground">Limite : {model.limits}</p>}
                          {model.features && model.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {model.features.map(f => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {plan.features && plan.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Fonctionnalités</h4>
                    <div className="space-y-1">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-success" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}