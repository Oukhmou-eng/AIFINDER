// FullProposalEditor.jsx
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../ui/accordion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Plus, X, Trash2, Building, Tag, Globe, Cpu, DollarSign, Info } from 'lucide-react';
import { categories, aiModels } from '../../lib/mock-data';
import { toast } from 'sonner';

export function FullProposalEditor({ initialData, onSave, onCancel }) {
    // ---------- État initial à partir de initialData ----------
    const [name, setName] = useState(initialData?.name || '');
    const [provider, setProvider] = useState(initialData?.provider || '');
    const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || initialData?.description || '');
    const [longDescription, setLongDescription] = useState(initialData?.longDescription || initialData?.description || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
    const [releaseDate, setReleaseDate] = useState(initialData?.releaseDate || '');
    const [isOpenSource, setIsOpenSource] = useState(initialData?.isOpenSource || false);
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [toolTags, setToolTags] = useState(initialData?.tags || []);
    const [newTagInput, setNewTagInput] = useState('');
    const existingTags = [
        { id: 'tag-1', name: 'Chatbot' }, { id: 'tag-2', name: 'Génération texte' },
        { id: 'tag-3', name: 'Code' }, { id: 'tag-4', name: 'Images' }, { id: 'tag-5', name: 'Audio' }
    ];
    const defaultPlatforms = ['Web', 'Mobile', 'API', 'Desktop', 'VS Code', 'Discord'];
    const [allPlatforms, setAllPlatforms] = useState(defaultPlatforms);
    const [selectedPlatforms, setSelectedPlatforms] = useState(initialData?.platforms || []);
    const [customPlatform, setCustomPlatform] = useState('');
    const [showCustomPlatformInput, setShowCustomPlatformInput] = useState(false);
    const [toolFeatures, setToolFeatures] = useState(initialData?.features || []);
    const [newFeatureName, setNewFeatureName] = useState('');
    const [newFeatureDesc, setNewFeatureDesc] = useState('');
    const [toolPerformances, setToolPerformances] = useState(initialData?.performances || []);
    const [perfDomain, setPerfDomain] = useState('');
    const [perfScore, setPerfScore] = useState(0);
    const [perfDesc, setPerfDesc] = useState('');
    const [toolPricingPlans, setToolPricingPlans] = useState(initialData?.pricingPlans || []);
    const [selectedModels, setSelectedModels] = useState(initialData?.models || []);
    const [toolPricingType, setToolPricingType] = useState(initialData?.pricingType || initialData?.pricing || 'freemium');

    // États pour les dialogues
    const [showPlanDialog, setShowPlanDialog] = useState(false);
    const [editingPlan, setEditingPlan] = useState({
        nameTemplate: '',
        name: '',
        type: 'paid',
        price: 0,
        currency: '€',
        currencyOther: '',
        period: 'month',
        description: '',
        features: [],
        availableModels: []
    });
    const [showNewModelDialog, setShowNewModelDialog] = useState(false);
    const [currentNewModel, setCurrentNewModel] = useState({
        id: '', name: '', provider: '', providerSelected: '', description: '',
        releaseDate: '', isOpenSource: false, hasApi: false, apiUrl: '',
        capabilities: [], performances: [], tags: [], pricingPlans: [],
        accessInTool: 'paid'
    });
    const [newApiPlan, setNewApiPlan] = useState({
        name: '',
        accessType: 'pay-as-you-go',
        inputTokenPrice: 0,
        outputTokenPrice: 0,
        currency: '€',
        quota: 0,
        quotaPeriod: 'month',
        limits: '',
        capabilities: '',
        overageRules: '',
    });
    const [newCapabilityInput, setNewCapabilityInput] = useState('');
    const [newPerfDomain, setNewPerfDomain] = useState('');
    const [newPerfScore, setNewPerfScore] = useState('');
    const [newPerfDesc, setNewPerfDesc] = useState('');
    const [newTagInputModel, setNewTagInputModel] = useState('');
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanPrice, setNewPlanPrice] = useState('');
    const [newPlanCurrency, setNewPlanCurrency] = useState('€');
    const [newPlanPeriod, setNewPlanPeriod] = useState('month');
    const [newPlanDesc, setNewPlanDesc] = useState('');

    // Fournisseurs existants
    const existingProviders = [...new Set(aiModels.map(m => m.provider))];
    const [selectedProvider, setSelectedProvider] = useState(initialData?.provider || '');
    const [newProviderInput, setNewProviderInput] = useState('');
    const [showNewProvider, setShowNewProvider] = useState(false);

    // Helper: ajouter fonctionnalité outil
    const addToolFeature = () => {
        if (newFeatureName.trim()) {
            setToolFeatures([...toolFeatures, { name: newFeatureName, description: newFeatureDesc }]);
            setNewFeatureName(''); setNewFeatureDesc('');
        }
    };
    const removeToolFeature = (idx) => setToolFeatures(toolFeatures.filter((_, i) => i !== idx));

    // Helper: ajouter performance outil
    const addToolPerformance = () => {
        if (perfDomain.trim() && perfScore >= 0 && perfScore <= 100) {
            setToolPerformances([...toolPerformances, { domain: perfDomain, score: perfScore, description: perfDesc }]);
            setPerfDomain(''); setPerfScore(0); setPerfDesc('');
        }
    };
    const removeToolPerformance = (idx) => setToolPerformances(toolPerformances.filter((_, i) => i !== idx));

    // Helper: tags
    const addToolTag = () => {
        if (newTagInput.trim()) {
            const exists = toolTags.some(t => t.name === newTagInput.trim());
            if (!exists) setToolTags([...toolTags, { id: `new-${Date.now()}`, name: newTagInput.trim(), isNew: true }]);
            setNewTagInput('');
        }
    };
    const selectExistingTag = (tag) => {
        if (!toolTags.some(t => t.id === tag.id)) setToolTags([...toolTags, tag]);
    };
    const removeTag = (tagId) => setToolTags(toolTags.filter(t => t.id !== tagId));

    // Helper: plateformes
    const togglePlatform = (platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };
    const addCustomPlatform = () => {
        if (customPlatform.trim() && !allPlatforms.includes(customPlatform.trim())) {
            setAllPlatforms([...allPlatforms, customPlatform.trim()]);
            setSelectedPlatforms([...selectedPlatforms, customPlatform.trim()]);
            setCustomPlatform('');
            setShowCustomPlatformInput(false);
        }
    };

    // Helper: gestion des plans tarifaires (copié de ProposeToolPage)
    const handleAddPlanFeature = () => {
        setEditingPlan({
            ...editingPlan,
            features: [...editingPlan.features, { name: '', limitType: 'none', limitValue: '', limitPeriod: 'month', limitOther: '' }]
        });
    };
    const updatePlanFeature = (idx, field, value) => {
        const newFeatures = [...editingPlan.features];
        newFeatures[idx] = { ...newFeatures[idx], [field]: value };
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };
    const removePlanFeature = (idx) => {
        setEditingPlan({
            ...editingPlan,
            features: editingPlan.features.filter((_, i) => i !== idx)
        });
    };
    const addPlanAvailableModel = () => {
        setEditingPlan({
            ...editingPlan,
            availableModels: [...editingPlan.availableModels, { modelId: '', limits: [] }]
        });
    };
    const addModelLimit = (modelIdx) => {
        const newModels = [...editingPlan.availableModels];
        if (!newModels[modelIdx].limits) newModels[modelIdx].limits = [];
        newModels[modelIdx].limits.push({ type: 'none', value: '', period: 'month' });
        setEditingPlan({ ...editingPlan, availableModels: newModels });
    };
    const updateModelLimit = (modelIdx, limitIdx, field, value) => {
        const newModels = [...editingPlan.availableModels];
        newModels[modelIdx].limits[limitIdx][field] = value;
        setEditingPlan({ ...editingPlan, availableModels: newModels });
    };
    const removeModelLimit = (modelIdx, limitIdx) => {
        const newModels = [...editingPlan.availableModels];
        newModels[modelIdx].limits.splice(limitIdx, 1);
        setEditingPlan({ ...editingPlan, availableModels: newModels });
    };
    const updatePlanModel = (idx, field, value) => {
        const newModels = [...editingPlan.availableModels];
        newModels[idx] = { ...newModels[idx], [field]: value };
        setEditingPlan({ ...editingPlan, availableModels: newModels });
    };
    const removePlanModel = (idx) => {
        setEditingPlan({
            ...editingPlan,
            availableModels: editingPlan.availableModels.filter((_, i) => i !== idx)
        });
    };
    const addFeatureLimit = (featureIdx) => {
        const newFeatures = [...editingPlan.features];
        if (!newFeatures[featureIdx].limits) newFeatures[featureIdx].limits = [];
        newFeatures[featureIdx].limits.push({ type: 'none', value: '', period: 'month' });
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };
    const updateFeatureLimit = (featureIdx, limitIdx, field, value) => {
        const newFeatures = [...editingPlan.features];
        newFeatures[featureIdx].limits[limitIdx][field] = value;
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };
    const removeFeatureLimit = (featureIdx, limitIdx) => {
        const newFeatures = [...editingPlan.features];
        newFeatures[featureIdx].limits.splice(limitIdx, 1);
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };
    const resetEditingPlan = () => {
        setEditingPlan({
            nameTemplate: '',
            name: '',
            type: 'paid',
            price: 0,
            currency: '€',
            currencyOther: '',
            period: 'month',
            description: '',
            features: [],
            availableModels: []
        });
    };
    const savePricingPlan = () => {
        if (!editingPlan.name) return;
        const newPlan = {
            name: editingPlan.name,
            type: editingPlan.type,
            price: editingPlan.price,
            currency: editingPlan.currency,
            period: editingPlan.period,
            description: editingPlan.description,
            features: editingPlan.features.map(f => ({
                name: f.name,
                limits: (f.limits || []).filter(l => l.type !== 'none' || (l.type === 'none' && l.value))
            })),
            availableModels: editingPlan.availableModels.map(m => ({
                modelId: m.modelId,
                limits: (m.limits || []).filter(l => l.type !== 'none' || (l.type === 'none' && l.value))
            }))
        };
        setToolPricingPlans([...toolPricingPlans, newPlan]);
        setShowPlanDialog(false);
        resetEditingPlan();
    };

    // Helper: gestion des modèles existants
    const handleAddExistingModel = (modelId) => {
        const model = aiModels.find(m => m.id === modelId);
        if (model && !selectedModels.find(m => m.id === model.id)) {
            setSelectedModels([...selectedModels, {
                id: model.id,
                name: model.name,
                provider: model.provider,
                description: model.description,
                type: model.capabilities.join(', '),
                releaseDate: '',
                isOpenSource: false,
                apiUrl: '',
                capabilities: model.capabilities,
                performances: [],
                tags: [],
                pricingPlans: [],
                accessInTool: 'paid'
            }]);
        }
    };
    const updateModelAccessInTool = (modelId, access) => {
        setSelectedModels(selectedModels.map(m =>
            m.id === modelId ? { ...m, accessInTool: access } : m
        ));
    };
    const removeModel = (modelId) => setSelectedModels(selectedModels.filter(m => m.id !== modelId));

    // Helper: nouveau modèle (dialogue complet)
    const openNewModelDialog = () => {
        setCurrentNewModel({
            id: `new-${Date.now()}`,
            name: '', provider: '', providerSelected: '', description: '',
            releaseDate: '', isOpenSource: false, hasApi: false, apiUrl: '',
            capabilities: [], performances: [], tags: [], pricingPlans: [],
            accessInTool: 'paid'
        });
        setShowNewModelDialog(true);
    };
    const addNewModelCapability = () => {
        if (newCapabilityInput.trim()) {
            setCurrentNewModel({
                ...currentNewModel,
                capabilities: [...currentNewModel.capabilities, newCapabilityInput.trim()]
            });
            setNewCapabilityInput('');
        }
    };
    const removeCapability = (idx) => {
        setCurrentNewModel({
            ...currentNewModel,
            capabilities: currentNewModel.capabilities.filter((_, i) => i !== idx)
        });
    };
    const addNewModelPerformance = () => {
        if (newPerfDomain.trim() && newPerfScore) {
            setCurrentNewModel({
                ...currentNewModel,
                performances: [...currentNewModel.performances, {
                    domain: newPerfDomain.trim(),
                    score: parseInt(newPerfScore),
                    description: newPerfDesc.trim()
                }]
            });
            setNewPerfDomain('');
            setNewPerfScore('');
            setNewPerfDesc('');
        }
    };
    const removeModelPerformance = (idx) => {
        setCurrentNewModel({
            ...currentNewModel,
            performances: currentNewModel.performances.filter((_, i) => i !== idx)
        });
    };
    const addNewModelTag = () => {
        if (newTagInputModel.trim()) {
            setCurrentNewModel({
                ...currentNewModel,
                tags: [...currentNewModel.tags, { id: `new-${Date.now()}`, name: newTagInputModel.trim() }]
            });
            setNewTagInputModel('');
        }
    };
    const removeModelTag = (idx) => {
        setCurrentNewModel({
            ...currentNewModel,
            tags: currentNewModel.tags.filter((_, i) => i !== idx)
        });
    };
    const addNewModelPricingPlan = () => {
        if (!newApiPlan.name) return;
        const plan = {
            name: newApiPlan.name,
            accessType: newApiPlan.accessType,
            inputTokenPrice: newApiPlan.inputTokenPrice,
            outputTokenPrice: newApiPlan.outputTokenPrice,
            currency: newApiPlan.currency,
            quota: newApiPlan.quota,
            quotaPeriod: newApiPlan.quotaPeriod,
            limits: newApiPlan.limits,
            capabilities: newApiPlan.capabilities,
            overageRules: newApiPlan.overageRules,
        };
        setCurrentNewModel({
            ...currentNewModel,
            pricingPlans: [...currentNewModel.pricingPlans, plan]
        });
        setNewApiPlan({
            name: '',
            accessType: 'pay-as-you-go',
            inputTokenPrice: 0,
            outputTokenPrice: 0,
            currency: '€',
            quota: 0,
            quotaPeriod: 'month',
            limits: '',
            capabilities: '',
            overageRules: '',
        });
    };
    const removeModelPricingPlan = (idx) => {
        setCurrentNewModel({
            ...currentNewModel,
            pricingPlans: currentNewModel.pricingPlans.filter((_, i) => i !== idx)
        });
    };
    const saveNewModel = () => {
        if (!currentNewModel.name || !currentNewModel.provider) {
            toast.error('Nom et fournisseur requis');
            return;
        }
        setSelectedModels([...selectedModels, currentNewModel]);
        setShowNewModelDialog(false);
    };

    // Helper: fournisseur
    const handleProviderChange = (val) => {
        if (val === 'new') {
            setShowNewProvider(true);
            setSelectedProvider('');
        } else {
            setShowNewProvider(false);
            setSelectedProvider(val);
        }
    };

    // Soumission de l'édition
    const handleSave = () => {
        // Validations minimales
        if (!name.trim()) { toast.error('Le nom est requis'); return; }
        if (!shortDescription.trim()) { toast.error('La description courte est requise'); return; }
        if (!longDescription.trim()) { toast.error('La description détaillée est requise'); return; }
        if (!url.trim()) { toast.error("L'URL est requise"); return; }
        const finalCategory = categoryId || newCategoryName;
        if (!finalCategory) { toast.error('Veuillez sélectionner ou créer une catégorie'); return; }
        if (selectedModels.length === 0) { toast.error('Veuillez sélectionner au moins un modèle AI'); return; }
        const finalProvider = showNewProvider ? newProviderInput : selectedProvider;
        if (!finalProvider) { toast.error('Le fournisseur est requis'); return; }

        const updatedProposal = {
            ...initialData,
            name,
            provider: finalProvider,
            shortDescription,
            longDescription,
            url,
            logoUrl,
            releaseDate,
            isOpenSource,
            categoryId: finalCategory,
            newCategoryDesc: showNewCategory ? newCategoryDesc : undefined,
            tags: toolTags,
            platforms: selectedPlatforms,
            features: toolFeatures,
            performances: toolPerformances,
            pricingPlans: toolPricingPlans,
            models: selectedModels,
            pricingType: toolPricingType,
            status: 'pending', // après modification, redevient en attente
            rejectionReason: undefined,
            suggestions: undefined,
            createdAt: initialData?.createdAt || new Date().toISOString(),
            reviewedAt: undefined,
        };
        onSave(updatedProposal);
    };

    // Rendu du formulaire (identique à ProposeToolPage mais sans layout)
    return (
        <div className="space-y-6 max-h-full overflow-y-auto p-2">
            {/* Bandeau d'information */}
            <Card className="border-primary/30 bg-primary/5">
                <CardContent className="flex items-start gap-3 pt-6">
                    <Info className="h-5 w-5 shrink-0 text-primary" />
                    <div className="text-sm">
                        <p className="font-medium text-foreground">Modification de la proposition</p>
                        <p className="mt-1 text-muted-foreground">
                            Après modification, votre proposition sera à nouveau soumise à l'examen de notre équipe.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={["general"]}>
                {/* Section Informations générales */}
                <AccordionItem value="general" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Informations générales</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom de l'outil *</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: ChatGPT" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="provider">Fournisseur / Éditeur *</Label>
                                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                                    <SelectTrigger><Building className="mr-2 h-4 w-4" /><SelectValue placeholder="Choisir un fournisseur" /></SelectTrigger>
                                    <SelectContent>
                                        {existingProviders.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        <SelectItem value="new">+ Ajouter un fournisseur</SelectItem>
                                    </SelectContent>
                                </Select>
                                {showNewProvider && (
                                    <Input placeholder="Nom du nouveau fournisseur" value={newProviderInput} onChange={(e) => setNewProviderInput(e.target.value)} />
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shortDesc">Description courte *</Label>
                            <Input id="shortDesc" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={100} placeholder="Une phrase décrivant l'outil" />
                            <p className="text-xs text-muted-foreground">{shortDescription.length}/100</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longDesc">Description détaillée *</Label>
                            <Textarea id="longDesc" rows={5} value={longDescription} onChange={(e) => setLongDescription(e.target.value)} placeholder="Description complète..." />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="url">Site officiel *</Label>
                                <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logoUrl">Logo (URL)</Label>
                                <Input id="logoUrl" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="releaseDate">Date de sortie</Label>
                                <Input id="releaseDate" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-3 mt-6">
                                <Label htmlFor="openSource">Open Source</Label>
                                <Switch id="openSource" checked={isOpenSource} onCheckedChange={setIsOpenSource} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pricingType">Type de tarification *</Label>
                            <Select value={toolPricingType} onValueChange={setToolPricingType}>
                                <SelectTrigger><DollarSign className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Gratuit</SelectItem>
                                    <SelectItem value="freemium">Freemium</SelectItem>
                                    <SelectItem value="paid">Payant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Section Catégorie et tags */}
                <AccordionItem value="category_tags" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Catégorie & tags</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Catégorie *</Label>
                            <Select value={categoryId} onValueChange={(val) => {
                                if (val === 'new') { setShowNewCategory(true); setCategoryId(''); }
                                else { setShowNewCategory(false); setCategoryId(val); setNewCategoryName(''); }
                            }}>
                                <SelectTrigger><Tag className="mr-2 h-4 w-4" /><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                    <SelectItem value="new">+ Nouvelle catégorie</SelectItem>
                                </SelectContent>
                            </Select>
                            {showNewCategory && (
                                <div className="mt-2 space-y-2">
                                    <Input placeholder="Nom de la nouvelle catégorie" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                                    <Input placeholder="Description (optionnel)" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {toolTags.map(tag => (
                                    <Badge key={tag.id} variant="secondary" className="gap-1">
                                        {tag.name}
                                        <button type="button" className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => removeTag(tag.id)}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input placeholder="Nouveau tag" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} className="flex-1" />
                                <Button type="button" size="sm" onClick={addToolTag}>Ajouter</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {existingTags.filter(t => !toolTags.some(tt => tt.id === t.id)).map(tag => (
                                    <Badge key={tag.id} variant="outline" className="cursor-pointer" onClick={() => selectExistingTag(tag)}>{tag.name}</Badge>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Section Plateformes */}
                <AccordionItem value="platforms" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Plateformes disponibles</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="flex flex-wrap gap-2">
                            {allPlatforms.map(p => (
                                <Badge key={p} variant={selectedPlatforms.includes(p) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => togglePlatform(p)}>
                                    {p}
                                </Badge>
                            ))}
                        </div>
                        <div>
                            {showCustomPlatformInput ? (
                                <div className="flex gap-2">
                                    <Input placeholder="Nouvelle plateforme" value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)} />
                                    <Button type="button" size="sm" onClick={addCustomPlatform}>Ajouter</Button>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowCustomPlatformInput(false)}>Annuler</Button>
                                </div>
                            ) : (
                                <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomPlatformInput(true)}>+ Ajouter une plateforme</Button>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Section Fonctionnalités propres */}
                <AccordionItem value="features" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Fonctionnalités propres</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        {toolFeatures.map((f, idx) => (
                            <div key={idx} className="flex justify-between items-start border-b pb-2">
                                <div><span className="font-medium">{f.name}</span>{f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}</div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeToolFeature(idx)}><X className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <div className="grid gap-2">
                            <Input placeholder="Nom de la fonctionnalité" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} />
                            <Input placeholder="Description (optionnel)" value={newFeatureDesc} onChange={(e) => setNewFeatureDesc(e.target.value)} />
                            <Button type="button" size="sm" onClick={addToolFeature}>Ajouter</Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Section Performances de l'outil */}
                <AccordionItem value="performances" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Performances</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        {toolPerformances.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b pb-2">
                                <div><span className="font-medium">{p.domain}</span> : {p.score}/100 {p.description && `(${p.description})`}</div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeToolPerformance(idx)}><X className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <div className="grid gap-2 sm:grid-cols-3">
                            <Input placeholder="Domaine (ex: Génération texte)" value={perfDomain} onChange={(e) => setPerfDomain(e.target.value)} />
                            <Input type="number" min="0" max="100" placeholder="Score /100" value={perfScore} onChange={(e) => setPerfScore(Number(e.target.value))} />
                            <Input placeholder="Description (optionnel)" value={perfDesc} onChange={(e) => setPerfDesc(e.target.value)} />
                        </div>
                        <Button type="button" size="sm" onClick={addToolPerformance}>Ajouter une performance</Button>
                    </AccordionContent>
                </AccordionItem>

                {/* Section Modèles AI utilisés */}
                <AccordionItem value="models" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Modèles AI utilisés</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        {selectedModels.map((model, idx) => (
                            <Card key={idx} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium">{model.name}</h4>
                                        <p className="text-sm text-muted-foreground">{model.provider}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs">Accès dans cet outil :</span>
                                            <Badge
                                                variant={model.accessInTool === 'free' ? 'success' : 'warning'}
                                                className="cursor-pointer"
                                                onClick={() => updateModelAccessInTool(model.id, model.accessInTool === 'free' ? 'paid' : 'free')}
                                            >
                                                {model.accessInTool === 'free' ? 'Gratuit' : 'Payant'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeModel(model.id)}><X className="h-4 w-4" /></Button>
                                </div>
                            </Card>
                        ))}
                        <div className="flex gap-2">
                            <Select onValueChange={handleAddExistingModel}>
                                <SelectTrigger className="flex-1"><Cpu className="mr-2 h-4 w-4" /><SelectValue placeholder="Ajouter un modèle existant" /></SelectTrigger>
                                <SelectContent>
                                    {aiModels.filter(m => !selectedModels.some(sm => sm.id === m.id)).map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.name} ({m.provider})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" onClick={openNewModelDialog}>+ Créer un nouveau modèle</Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Section Plans tarifaires de l'outil */}
                <AccordionItem value="pricing" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Plans tarifaires</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        {toolPricingPlans.map((plan, idx) => (
                            <Card key={idx} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{plan.name}</h4>
                                        <p>{plan.price}{plan.currency} / {plan.period}</p>
                                        {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                                        <div className="mt-2">
                                            <span className="text-xs font-medium">Fonctionnalités:</span>
                                            <ul className="list-disc list-inside text-xs">
                                                {plan.features.map((f, i) => (
                                                    <li key={i}>
                                                        {f.name}
                                                        {f.limits && f.limits.length > 0 && (
                                                            <ul className="ml-4 list-circle">
                                                                {f.limits.map((limit, li) => (
                                                                    <li key={li}>
                                                                        {limit.type !== 'none' && limit.value
                                                                            ? `${limit.value} ${limit.type}${limit.period !== 'total' ? ` / ${limit.period}` : ' total'}`
                                                                            : 'Aucune limite'}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-xs font-medium">Modèles accessibles:</span>
                                            <ul className="list-disc list-inside text-xs">
                                                {plan.availableModels.map((m, i) => (
                                                    <li key={i}>
                                                        {m.modelId}
                                                        {m.limits && m.limits.length > 0 && (
                                                            <ul className="ml-4 list-circle">
                                                                {m.limits.map((limit, li) => (
                                                                    <li key={li}>
                                                                        {limit.type !== 'none' && limit.value
                                                                            ? `${limit.value} ${limit.type}${limit.period !== 'total' ? ` / ${limit.period}` : ' total'}`
                                                                            : 'Aucune limite'}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setToolPricingPlans(toolPricingPlans.filter((_, i) => i !== idx))}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" onClick={() => setShowPlanDialog(true)}>+ Ajouter un plan</Button>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={onCancel}>Annuler</Button>
                <Button onClick={handleSave}>Envoyer la modification</Button>
            </div>

            {/* Dialogue pour ajouter un plan tarifaire (reproduit identiquement à ProposeToolPage) */}
            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Ajouter un plan tarifaire</DialogTitle><DialogDescription>Définissez un forfait</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Nom du plan */}
                        <div className="grid gap-2">
                            <Label>Nom du plan *</Label>
                            <Select value={editingPlan.nameTemplate} onValueChange={(val) => {
                                if (val === 'custom') setEditingPlan({ ...editingPlan, nameTemplate: 'custom', name: '' });
                                else setEditingPlan({ ...editingPlan, nameTemplate: val, name: val });
                            }}>
                                <SelectTrigger><SelectValue placeholder="Choisir un type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Gratuit">Gratuit</SelectItem><SelectItem value="Plus">Plus</SelectItem>
                                    <SelectItem value="Pro">Pro</SelectItem><SelectItem value="custom">Autre...</SelectItem>
                                </SelectContent>
                            </Select>
                            {editingPlan.nameTemplate === 'custom' && <Input placeholder="Nom personnalisé" value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} />}
                        </div>
                        {/* Type de plan */}
                        <div className="grid gap-2">
                            <Label>Type de tarification *</Label>
                            <Select value={editingPlan.type} onValueChange={(val) => setEditingPlan({ ...editingPlan, type: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="free">Gratuit</SelectItem><SelectItem value="paid">Payant</SelectItem></SelectContent>
                            </Select>
                        </div>
                        {/* Prix et devise */}
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Prix</Label><Input type="number" step="any" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })} /></div>
                            <div><Label>Devise</Label><Select value={editingPlan.currency} onValueChange={(val) => {
                                if (val === 'other') setEditingPlan({ ...editingPlan, currency: '' });
                                else setEditingPlan({ ...editingPlan, currency: val });
                            }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="€">€</SelectItem><SelectItem value="$">$</SelectItem><SelectItem value="other">Autre...</SelectItem></SelectContent>
                            </Select>
                                {editingPlan.currency === '' && <Input placeholder="Devise" value={editingPlan.currencyOther} onChange={(e) => setEditingPlan({ ...editingPlan, currencyOther: e.target.value, currency: e.target.value })} />}
                            </div>
                            {/* Période */}
                            <div><Label>Période</Label><Select value={editingPlan.period} onValueChange={(val) => setEditingPlan({ ...editingPlan, period: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="month">/mois</SelectItem><SelectItem value="year">/an</SelectItem><SelectItem value="week">/semaine</SelectItem><SelectItem value="day">/jour</SelectItem><SelectItem value="one-time">unique</SelectItem></SelectContent>
                            </Select></div>
                            <Textarea placeholder="Description" value={editingPlan.description} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} />
                            {/* Fonctionnalités incluses (avec limites) */}
                            <div className="space-y-3"><Label>Fonctionnalités incluses</Label>
                                {editingPlan.features.map((f, idx) => (
                                    <div key={idx} className="border p-3 space-y-2">
                                        <Input placeholder="Nom" value={f.name} onChange={(e) => updatePlanFeature(idx, 'name', e.target.value)} />
                                        <div className="grid grid-cols-4 gap-2">
                                            <Select value={f.limitType} onValueChange={(val) => updatePlanFeature(idx, 'limitType', val)}>
                                                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                                <SelectContent><SelectItem value="none">Aucune</SelectItem><SelectItem value="messages">Messages</SelectItem><SelectItem value="tokens">Tokens</SelectItem><SelectItem value="requests">Requêtes</SelectItem><SelectItem value="other">Autre</SelectItem></SelectContent>
                                            </Select>
                                            {f.limitType !== 'none' && f.limitType !== 'other' && <Input type="number" placeholder="Valeur" value={f.limitValue} onChange={(e) => updatePlanFeature(idx, 'limitValue', e.target.value)} />}
                                            {f.limitType === 'other' && <Input placeholder="Autre" value={f.limitOther} onChange={(e) => updatePlanFeature(idx, 'limitOther', e.target.value)} />}
                                            {f.limitType !== 'none' && <Select value={f.limitPeriod} onValueChange={(val) => updatePlanFeature(idx, 'limitPeriod', val)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hour">/heure</SelectItem><SelectItem value="day">/jour</SelectItem><SelectItem value="week">/semaine</SelectItem><SelectItem value="month">/mois</SelectItem><SelectItem value="year">/an</SelectItem><SelectItem value="total">total</SelectItem></SelectContent></Select>}
                                            <Button variant="ghost" size="icon" onClick={() => removePlanFeature(idx)}><X className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={handleAddPlanFeature}>+ Ajouter une fonctionnalité</Button>
                            </div>
                            {/* Modèles accessibles dans ce plan */}
                            <div className="space-y-3"><Label>Modèles accessibles</Label>
                                {editingPlan.availableModels.map((m, idx) => (
                                    <div key={idx} className="border p-3 space-y-2">
                                        <Select value={m.modelId} onValueChange={(val) => updatePlanModel(idx, 'modelId', val)}>
                                            <SelectTrigger><SelectValue placeholder="Modèle" /></SelectTrigger>
                                            <SelectContent>{selectedModels.filter(model => editingPlan.type === 'free' ? model.accessInTool === 'free' : true).map(model => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <div className="grid grid-cols-4 gap-2">
                                            <Select value={m.limitType} onValueChange={(val) => updatePlanModel(idx, 'limitType', val)}>
                                                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                                <SelectContent><SelectItem value="none">Aucune</SelectItem><SelectItem value="messages">Messages</SelectItem><SelectItem value="tokens">Tokens</SelectItem><SelectItem value="other">Autre</SelectItem></SelectContent>
                                            </Select>
                                            {m.limitType !== 'none' && <Input type="number" placeholder="Valeur" value={m.limitValue} onChange={(e) => updatePlanModel(idx, 'limitValue', e.target.value)} />}
                                            {m.limitType !== 'none' && <Select value={m.limitPeriod} onValueChange={(val) => updatePlanModel(idx, 'limitPeriod', val)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hour">/heure</SelectItem><SelectItem value="day">/jour</SelectItem><SelectItem value="week">/semaine</SelectItem><SelectItem value="month">/mois</SelectItem><SelectItem value="year">/an</SelectItem><SelectItem value="total">total</SelectItem></SelectContent></Select>}
                                            <Button variant="ghost" size="icon" onClick={() => removePlanModel(idx)}><X className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addPlanAvailableModel}>+ Ajouter un modèle</Button>
                            </div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setShowPlanDialog(false)}>Annuler</Button><Button onClick={savePricingPlan}>Ajouter</Button></DialogFooter>
                    </div>    
                </DialogContent>
            </Dialog>

            {/* Dialogue pour créer un nouveau modèle (identique) */}
            <Dialog open={showNewModelDialog} onOpenChange={setShowNewModelDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Nouveau modèle AI</DialogTitle><DialogDescription>Renseignez toutes les caractéristiques</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Nom *</Label><Input value={currentNewModel.name} onChange={(e) => setCurrentNewModel({ ...currentNewModel, name: e.target.value })} /></div>
                            <div><Label>Fournisseur *</Label><Select value={currentNewModel.providerSelected} onValueChange={(val) => {
                                if (val === 'new') setCurrentNewModel({ ...currentNewModel, providerSelected: 'new', provider: '' });
                                else setCurrentNewModel({ ...currentNewModel, providerSelected: val, provider: val });
                            }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{existingProviders.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}<SelectItem value="new">+ Nouveau</SelectItem></SelectContent></Select>
                                {currentNewModel.providerSelected === 'new' && <Input placeholder="Nom du nouveau fournisseur" value={currentNewModel.provider} onChange={(e) => setCurrentNewModel({ ...currentNewModel, provider: e.target.value })} />}
                            </div>
                        </div>
                        <Textarea placeholder="Description" rows={3} value={currentNewModel.description} onChange={(e) => setCurrentNewModel({ ...currentNewModel, description: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="date" placeholder="Date de sortie" value={currentNewModel.releaseDate} onChange={(e) => setCurrentNewModel({ ...currentNewModel, releaseDate: e.target.value })} />
                            <div className="flex items-center gap-2"><Label>Open Source</Label><Switch checked={currentNewModel.isOpenSource} onCheckedChange={(v) => setCurrentNewModel({ ...currentNewModel, isOpenSource: v })} /></div>
                        </div>
                        <div className="flex items-center gap-2"><Label>Possède une API</Label><Switch checked={currentNewModel.hasApi} onCheckedChange={(v) => setCurrentNewModel({ ...currentNewModel, hasApi: v, apiUrl: v ? currentNewModel.apiUrl : '' })} /></div>
                        {currentNewModel.hasApi && <Input placeholder="URL API (optionnel)" value={currentNewModel.apiUrl} onChange={(e) => setCurrentNewModel({ ...currentNewModel, apiUrl: e.target.value })} />}
                        <div className="space-y-2"><Label>Fonctionnalités (capacités)</Label><div className="flex flex-wrap gap-2">{currentNewModel.capabilities.map((cap, idx) => <Badge key={idx} variant="secondary">{cap}<button className="ml-1" onClick={() => removeCapability(idx)}>×</button></Badge>)}</div>
                            <div className="flex gap-2"><Input placeholder="Nouvelle fonctionnalité" value={newCapabilityInput} onChange={(e) => setNewCapabilityInput(e.target.value)} /><Button size="sm" onClick={addNewModelCapability}>Ajouter</Button></div></div>
                        <div className="space-y-2"><Label>Performances</Label>{currentNewModel.performances.map((p, idx) => <div key={idx} className="flex justify-between">{p.domain}: {p.score}/100 <Button variant="ghost" size="sm" onClick={() => removeModelPerformance(idx)}><X /></Button></div>)}
                            <div className="grid grid-cols-3 gap-2"><Input placeholder="Domaine" value={newPerfDomain} onChange={(e) => setNewPerfDomain(e.target.value)} /><Input type="number" placeholder="Score" value={newPerfScore} onChange={(e) => setNewPerfScore(e.target.value)} /><Input placeholder="Description" value={newPerfDesc} onChange={(e) => setNewPerfDesc(e.target.value)} /></div>
                            <Button size="sm" onClick={addNewModelPerformance}>Ajouter une performance</Button></div>
                        <div className="space-y-2"><Label>Tags</Label><div className="flex flex-wrap gap-2">{currentNewModel.tags.map((tag, idx) => <Badge variant="outline">{tag.name}<button className="ml-1" onClick={() => removeModelTag(idx)}>×</button></Badge>)}</div>
                            <div className="flex gap-2"><Input placeholder="Nouveau tag" value={newTagInputModel} onChange={(e) => setNewTagInputModel(e.target.value)} /><Button size="sm" onClick={addNewModelTag}>Ajouter</Button></div></div>
                        <div className="space-y-2"><Label>Plans tarifaires API</Label>{currentNewModel.pricingPlans.map((plan, idx) => <div key={idx} className="border p-2">{plan.name}: {plan.price}{plan.currency}/{plan.period}<Button variant="ghost" size="sm" onClick={() => removeModelPricingPlan(idx)}>Supprimer</Button></div>)}
                            <div className="border p-3 space-y-2"><Input placeholder="Nom du plan" value={newApiPlan.name} onChange={(e) => setNewApiPlan({ ...newApiPlan, name: e.target.value })} />
                                <Select value={newApiPlan.accessType} onValueChange={(val) => setNewApiPlan({ ...newApiPlan, accessType: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pay-as-you-go">Pay as you go</SelectItem><SelectItem value="subscription">Abonnement</SelectItem></SelectContent></Select>
                                <div className="grid grid-cols-2 gap-2"><Input type="number" placeholder="Prix input (token)" value={newApiPlan.inputTokenPrice} onChange={(e) => setNewApiPlan({ ...newApiPlan, inputTokenPrice: parseFloat(e.target.value) })} /><Input type="number" placeholder="Prix output (token)" value={newApiPlan.outputTokenPrice} onChange={(e) => setNewApiPlan({ ...newApiPlan, outputTokenPrice: parseFloat(e.target.value) })} /></div>
                                <div className="flex gap-2"><Input placeholder="Devise" value={newApiPlan.currency} onChange={(e) => setNewApiPlan({ ...newApiPlan, currency: e.target.value })} className="w-24" /><Input type="number" placeholder="Quota" value={newApiPlan.quota} onChange={(e) => setNewApiPlan({ ...newApiPlan, quota: parseInt(e.target.value) || 0 })} /><Select value={newApiPlan.quotaPeriod} onValueChange={(val) => setNewApiPlan({ ...newApiPlan, quotaPeriod: val })}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="day">/jour</SelectItem><SelectItem value="week">/semaine</SelectItem><SelectItem value="month">/mois</SelectItem><SelectItem value="year">/an</SelectItem><SelectItem value="none">aucun</SelectItem></SelectContent></Select></div>
                                <Textarea placeholder="Limites" value={newApiPlan.limits} onChange={(e) => setNewApiPlan({ ...newApiPlan, limits: e.target.value })} />
                                <Textarea placeholder="Capacités" value={newApiPlan.capabilities} onChange={(e) => setNewApiPlan({ ...newApiPlan, capabilities: e.target.value })} />
                                <Textarea placeholder="Règles de dépassement" value={newApiPlan.overageRules} onChange={(e) => setNewApiPlan({ ...newApiPlan, overageRules: e.target.value })} />
                                <Button size="sm" onClick={addNewModelPricingPlan}>Ajouter ce plan</Button></div></div>
                        <div className="flex items-center gap-2"><Label>Accès dans cet outil :</Label><Select value={currentNewModel.accessInTool} onValueChange={(v) => setCurrentNewModel({ ...currentNewModel, accessInTool: v })}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="free">Gratuit</SelectItem><SelectItem value="paid">Payant</SelectItem></SelectContent></Select></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowNewModelDialog(false)}>Annuler</Button><Button onClick={saveNewModel}>Ajouter</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}