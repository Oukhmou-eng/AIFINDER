import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PricingPlansSection({ plans, type = 'tool' }) {
  if (!plans || plans.length === 0) return null;

  function formatTokenUnit(unit) {
    if (unit >= 1_000_000) return (unit / 1_000_000).toFixed(0) + 'M';
    if (unit >= 1_000) return (unit / 1_000).toFixed(0) + 'k';
    return unit.toString();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans tarifaires</CardTitle>
        <CardDescription>
          {type === 'tool' ? "L'outil propose différents niveaux d'abonnement." : "Le modèle est accessible via différents plans."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <Card key={idx} className="flex flex-col border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground"> / {plan.period === 'month' || plan.period === 'mois' ? 'mois' : 'an'}</span>
                </div>
                {plan.description && <CardDescription className="mt-1">{plan.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {plan.availableModels && plan.availableModels.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Modèles accessibles</h4>
                    <div className="space-y-2">
                      {plan.availableModels.map(model => (
                        <div key={model.modelId} className="border rounded-lg p-2 text-sm bg-muted/20">
                          <p className="font-medium">{model.name}</p>
                          {model.limits && <p className="text-xs text-muted-foreground mt-0.5">Limite : {model.limits}</p>}
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
                {type === 'model' && (
                  <div className="text-sm text-muted-foreground">
                    {(plan.inputPrice !== null || plan.outputPrice !== null) ? (
                      <>
                        {plan.inputPrice !== null && (
                          <div>Entrée : {plan.inputPrice} {plan.currency} / {formatTokenUnit(plan.priceUnit)} tokens</div>
                        )}
                        {plan.outputPrice !== null && (
                          <div>Sortie : {plan.outputPrice} {plan.currency} / {formatTokenUnit(plan.priceUnit)} tokens</div>
                        )}
                      </>
                    ) : (
                      <div>Prix à l’utilisation non renseigné</div>
                    )}
                    {plan.limits ? (
                      <p className="text-xs text-muted-foreground mt-1">Limite : {plan.limits}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Aucune limite spécifiée</p>
                    )}
                  </div>
                )}
                {plan.features && plan.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Fonctionnalités incluses</h4>
                    <div className="space-y-1">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-3.5 w-3.5 text-success shrink-0" />
                          <span>{f}</span>
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