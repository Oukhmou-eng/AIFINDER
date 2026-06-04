<?php

require_once __DIR__ . '/../utils/validator.php';

class ResourceController
{
    private array $resources = [
        'tags' => ['model' => 'Tag', 'file' => 'Tag.php', 'key' => 'tags'],
        'platforms' => ['model' => 'Platform', 'file' => 'Platform.php', 'key' => 'platforms'],
        'providers' => ['model' => 'Provider', 'file' => 'Provider.php', 'key' => 'providers'],
        'features' => ['model' => 'Feature', 'file' => 'Feature.php', 'key' => 'features'],
        'characteristics' => ['model' => 'Characteristic', 'file' => 'Characteristic.php', 'key' => 'characteristics'],
        'pricing_plans' => ['model' => 'PricingPlan', 'file' => 'PricingPlan.php', 'key' => 'pricingPlans'],
        'model_pricing' => ['model' => 'ModelPricing', 'file' => 'ModelPricing.php', 'key' => 'modelPricing'],
        'performances' => ['model' => 'Performance', 'file' => 'Performance.php', 'key' => 'performances'],
        'comments' => ['model' => 'Comment', 'file' => 'Comment.php', 'key' => 'comments'],
        'reactions' => ['model' => 'Reaction', 'file' => 'Reaction.php', 'key' => 'reactions'],
        'reports' => ['model' => 'Report', 'file' => 'Report.php', 'key' => 'reports'],
        'favorites' => ['model' => 'Favorite', 'file' => 'Favorite.php', 'key' => 'favorites'],
        'search_history' => ['model' => 'SearchHistory', 'file' => 'SearchHistory.php', 'key' => 'searchHistory'],
        'submissions' => ['model' => 'ToolSubmission', 'file' => 'ToolSubmission.php', 'key' => 'submissions'],
        'plan_models' => ['model' => 'PlanModel', 'file' => 'PlanModel.php', 'key' => 'planModels'],
        'plan_model_limits' => ['model' => 'PlanModelLimit', 'file' => 'PlanModelLimit.php', 'key' => 'planModelLimits'],
        'outil_categorie' => ['model' => 'ToolCategory', 'file' => 'ToolCategory.php', 'key' => 'toolCategories'],
        'outil_tag' => ['model' => 'ToolTag', 'file' => 'ToolTag.php', 'key' => 'toolTags'],
        'outil_model' => ['model' => 'ToolModel', 'file' => 'ToolModel.php', 'key' => 'toolModels'],
        'outil_caracteristique' => ['model' => 'ToolCharacteristic', 'file' => 'ToolCharacteristic.php', 'key' => 'toolCharacteristics'],
        'outil_plateforme' => ['model' => 'ToolPlatform', 'file' => 'ToolPlatform.php', 'key' => 'toolPlatforms'],
        'collection_outil' => ['model' => 'CollectionTool', 'file' => 'CollectionTool.php', 'key' => 'collectionTools'],
        'validation_outil' => ['model' => 'ToolValidation', 'file' => 'ToolValidation.php', 'key' => 'toolValidations'],
        'model_caracteristique' => ['model' => 'ModelCharacteristic', 'file' => 'ModelCharacteristic.php', 'key' => 'modelCharacteristics'],
        'model_feature' => ['model' => 'ModelFeature', 'file' => 'ModelFeature.php', 'key' => 'modelFeatures'],
        'outil_feature' => ['model' => 'ToolFeature', 'file' => 'ToolFeature.php', 'key' => 'toolFeatures'],
        'plan_feature' => ['model' => 'PlanFeature', 'file' => 'PlanFeature.php', 'key' => 'planFeatures'],
        'outil_performance' => ['model' => 'ToolPerformance', 'file' => 'ToolPerformance.php', 'key' => 'toolPerformances'],
        'model_performance' => ['model' => 'ModelPerformance', 'file' => 'ModelPerformance.php', 'key' => 'modelPerformances'],
    ];

    public function list(array $data)
    {
        $resource = $data['resource'] ?? null;
        if (!$resource || !isset($this->resources[$resource])) {
            fail('Ressource inconnue', 404);
        }

        $config = $this->resources[$resource];
        require_once __DIR__ . '/../models/' . $config['file'];
        $model = new $config['model']();

        ok([$config['key'] => $model->all($data['limit'] ?? 100)]);
    }

    public function item(array $data)
    {
        $resource = $data['resource'] ?? null;
        $id = $data['id'] ?? null;

        if (!$resource || !isset($this->resources[$resource]) || !$id) {
            fail('Ressource ou identifiant manquant', 422);
        }

        $config = $this->resources[$resource];
        require_once __DIR__ . '/../models/' . $config['file'];
        $model = new $config['model']();
        $item = $model->find($id);

        $item ? ok(['item' => $item]) : fail('Element introuvable', 404);
    }
}
