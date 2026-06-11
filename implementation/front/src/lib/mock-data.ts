// mock-data.ts

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  pricing: 'free' | 'freemium' | 'paid';
  benchmarks?: Record<string, number>;
  pricingPlans?: PricingPlan[];
}

export interface PricingPlan {
  name: string;
  price: number;
  currency?: string;
  period: 'month' | 'year' | 'one-time';
  description?: string;
  availableModels?: AvailableModelInPlan[];
  features?: string[];
}

export interface AvailableModelInPlan {
  modelId: string;
  limits?: string;
  features?: string[];
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  logo: string;
  url: string;
  categoryIds: string[]; // ← modifié : maintenant un tableau
  aiModels: { modelId: string; accessType: string }[];
  pricing: 'free' | 'freemium' | 'paid';
  priceDetails?: string;
  platforms: ('web' | 'mobile' | 'api' | 'desktop')[];
  functions: ('text' | 'image' | 'audio' | 'video' | 'code')[];
  rating: number;
  reviewCount: number;
  usageCount: number;
  trendingScore: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  hasApiTest: boolean;
  screenshots: string[];
  videoUrl?: string;
  status?: 'active' | 'pending' | 'rejected';
  benchmarks?: Record<string, number>;
  ownFeatures?: string[];
  pricingPlans?: PricingPlan[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  toolCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'suspended';
  favorites: string[];
  collections: Collection[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  toolIds: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  toolId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  replies: ReviewReply[];
}

export interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  createdAt: string;
}

export interface Report {
  id: string;
  type: 'tool' | 'comment';
  targetId: string;
  userId: string;
  reason: 'deprecated' | 'outdated' | 'unavailable' | 'incorrect' | 'spam' | 'inappropriate' | 'other';
  details?: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'tool_approved' | 'tool_rejected' | 'report_resolved' | 'new_tool' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ProposedTool {
  id: string;
  userId: string;
  name: string;
  description: string;
  longDescription?: string;
  url: string;
  logo?: string;
  logoUrl?: string;
  categoryId: string; // toujours une seule pour la proposition (on peut l'étendre plus tard)
  newCategory?: string;
  newCategoryDesc?: string;
  releaseDate?: string;
  isOpenSource?: boolean;
  tags?: object[];
  platforms?: string[];
  pricingType?: 'free' | 'freemium' | 'paid';
  features?: object[];
  performances?: object[];
  models?: object[];
  pricingPlans?: object[];
  aiModels: { modelId: string; newModel?: string; accessType: 'free' | 'paid' }[];
  pricing: 'free' | 'freemium' | 'paid';
  priceDetails?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// ---------- AI MODELS ----------
export const aiModels: AIModel[] = [
  /* {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Modèle multimodal avancé capable de traiter texte et images avec une grande précision.',
    capabilities: ['text', 'image', 'code', 'reasoning'],
    pricing: 'paid',
    benchmarks: { mmlu: 86, humanEval: 82, math: 78, reasoning: 89 },
    pricingPlans: [{ name: 'API', price: 0.03, currency: 'USD', period: 'one-time', description: 'par 1k tokens' }]
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Version optimisée de GPT-4 avec des temps de réponse plus rapides.',
    capabilities: ['text', 'image', 'audio', 'code'],
    pricing: 'paid',
    benchmarks: { mmlu: 88, humanEval: 85, math: 80, reasoning: 91 },
    pricingPlans: [{ name: 'API', price: 0.005, currency: 'USD', period: 'one-time', description: 'par 1k tokens (entrée)' }]
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Modèle rapide et économique pour les tâches conversationnelles.',
    capabilities: ['text', 'code'],
    pricing: 'freemium',
    benchmarks: { mmlu: 70, humanEval: 68, math: 65, reasoning: 72 },
    pricingPlans: [{ name: 'API', price: 0.0015, currency: 'USD', period: 'one-time', description: 'par 1k tokens' }]
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Le modèle le plus puissant d\'Anthropic pour les tâches complexes.',
    capabilities: ['text', 'image', 'code', 'reasoning'],
    pricing: 'paid',
    benchmarks: { mmlu: 87, humanEval: 84, math: 79, reasoning: 90 },
    pricingPlans: [{ name: 'API', price: 0.015, currency: 'USD', period: 'one-time', description: 'par 1k tokens' }]
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Équilibre idéal entre performance et coût.',
    capabilities: ['text', 'image', 'code'],
    pricing: 'paid',
    benchmarks: { mmlu: 83, humanEval: 80, math: 75, reasoning: 85 },
    pricingPlans: [{ name: 'API', price: 0.003, currency: 'USD', period: 'one-time', description: 'par 1k tokens' }]
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Modèle rapide et léger pour les réponses instantanées.',
    capabilities: ['text', 'code'],
    pricing: 'freemium',
    benchmarks: { mmlu: 75, humanEval: 72, math: 70, reasoning: 78 }
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Modèle multimodal de Google pour des tâches variées.',
    capabilities: ['text', 'image', 'code'],
    pricing: 'freemium',
    benchmarks: { mmlu: 80, humanEval: 78, math: 74, reasoning: 82 }
  },
  {
    id: 'gemini-ultra',
    
    name: 'Gemini Ultra',
    provider: 'Google',
    description: 'Le modèle le plus avancé de Google.',
    capabilities: ['text', 'image', 'audio', 'video', 'code'],
    pricing: 'paid',
    benchmarks: { mmlu: 85, humanEval: 83, math: 78, reasoning: 88 }
  },
  {
    id: 'llama-3',
    name: 'LLaMA 3',
    provider: 'Meta',
    description: 'Modèle open source performant de Meta.',
    capabilities: ['text', 'code'],
    pricing: 'free',
    benchmarks: { mmlu: 79, humanEval: 75, math: 72, reasoning: 80 }
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'Modèle européen haute performance.',
    capabilities: ['text', 'code', 'reasoning'],
    pricing: 'paid',
    benchmarks: { mmlu: 84, humanEval: 81, math: 77, reasoning: 86 }
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    description: 'Génération d\'images de haute qualité.',
    capabilities: ['image'],
    pricing: 'freemium',
    benchmarks: { image_quality: 92, prompt_following: 88 }
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    description: 'Génération d\'images à partir de descriptions textuelles.',
    capabilities: ['image'],
    pricing: 'paid',
    benchmarks: { image_quality: 94, prompt_following: 91 }
  },
  {
    id: 'midjourney-v6',
    name: 'Midjourney v6',
    provider: 'Midjourney',
    description: 'Génération artistique d\'images.',
    capabilities: ['image'],
    pricing: 'paid',
    benchmarks: { image_quality: 96, creativity: 95, prompt_following: 89 }
  },
  {
    id: 'whisper',
    name: 'Whisper',
    provider: 'OpenAI',
    description: 'Transcription audio vers texte multilingue.',
    capabilities: ['audio'],
    pricing: 'freemium',
    benchmarks: { accuracy: 95, speed: 88, multilingual: 92 }
  },
  {
    id: 'eleven-labs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    description: 'Synthèse vocale réaliste.',
    capabilities: ['audio'],
    pricing: 'freemium',
    benchmarks: { voice_quality: 97, emotion_capture: 94, latency: 85 }
  } */
];

// ---------- CATEGORIES ----------
export const categories: Category[] = [
 /*  { id: 'writing', name: 'Rédaction & Contenu', slug: 'redaction-contenu', description: 'Outils pour la rédaction, le copywriting et la création de contenu.', icon: 'PenLine', toolCount: 12 },
  { id: 'image', name: 'Génération d\'images', slug: 'generation-images', description: 'Créez des images uniques avec l\'IA.', icon: 'Image', toolCount: 8 },
  { id: 'code', name: 'Développement & Code', slug: 'developpement-code', description: 'Assistants de programmation et outils de développement.', icon: 'Code', toolCount: 15 },
  { id: 'audio', name: 'Audio & Voix', slug: 'audio-voix', description: 'Transcription, synthèse vocale et édition audio.', icon: 'Mic', toolCount: 6 },
  { id: 'video', name: 'Vidéo', slug: 'video', description: 'Édition et génération de vidéos par IA.', icon: 'Video', toolCount: 5 },
  { id: 'productivity', name: 'Productivité', slug: 'productivite', description: 'Automatisation et outils de productivité.', icon: 'Zap', toolCount: 10 },
  { id: 'chatbot', name: 'Chatbots & Assistants', slug: 'chatbots-assistants', description: 'Assistants conversationnels et chatbots.', icon: 'MessageSquare', toolCount: 9 },
  { id: 'research', name: 'Recherche & Analyse', slug: 'recherche-analyse', description: 'Outils de recherche et d\'analyse de données.', icon: 'Search', toolCount: 7 },
  { id: 'design', name: 'Design & Créativité', slug: 'design-creativite', description: 'Outils de design assistés par IA.', icon: 'Palette', toolCount: 8 },
  { id: 'marketing', name: 'Marketing', slug: 'marketing', description: 'Outils marketing et publicité.', icon: 'TrendingUp', toolCount: 6 }
 */];

// ---------- TOOLS (avec categoryIds) ----------
export const tools: Tool[] = [
 /*  {
    id: 'chatgpt', name: 'ChatGPT', slug: 'chatgpt', description: 'Assistant conversationnel polyvalent basé sur GPT-4.',
    longDescription: 'ChatGPT est un assistant IA développé par OpenAI...',
    logo: '/logos/chatgpt.svg', url: 'https://chat.openai.com', categoryIds: ['chatbot', 'writing'],
    aiModels: [
      { modelId: 'gpt-4', accessType: 'paid' },
      { modelId: 'gpt-4o', accessType: 'paid' },
      { modelId: 'gpt-3.5-turbo', accessType: 'free' }
    ],
    pricing: 'freemium', priceDetails: 'Gratuit avec GPT-3.5, Plus à 20$/mois pour GPT-4',
    platforms: ['web', 'mobile', 'api'], functions: ['text', 'code', 'image'],
    rating: 4.7, reviewCount: 2847, usageCount: 150000, trendingScore: 98,
    createdAt: '2022-11-30', updatedAt: '2024-01-15', featured: true, hasApiTest: true,
    screenshots: ['/screenshots/chatgpt-1.png', '/screenshots/chatgpt-2.png'],
    status: 'active',
    benchmarks: { text: 95, code: 88, reasoning: 92, image: 80, audio: 70 },
    ownFeatures: ['Memory', 'Projects', 'Custom GPTs', 'Canvas'],
    pricingPlans: [
      { name: 'Gratuit', price: 0, period: 'month', description: 'Accès limité', availableModels: [{ modelId: 'GPT-4o', limits: '20 messages / jour', features: ['Chat', 'Vision'] }], features: ['Chat', 'Vision'] },
      { name: 'Plus', price: 20, period: 'month', description: 'Accès prioritaire', availableModels: [{ modelId: 'GPT-4o', limits: '80 messages / 3 heures', features: ['Chat', 'Vision', 'Analyse de fichiers'] }, { modelId: 'GPT-4', limits: '50 messages / 3 heures', features: ['Chat', 'Vision'] }], features: ['Chat', 'Vision', 'Deep Research', 'Operator'] },
      { name: 'Pro', price: 200, period: 'month', description: 'Accès illimité', availableModels: [{ modelId: 'GPT-4o', limits: 'Illimité', features: ['Chat', 'Vision', 'Analyse de fichiers'] }, { modelId: 'GPT-4', limits: 'Illimité', features: ['Chat', 'Vision'] }, { modelId: 'O3', limits: 'Illimité', features: ['Raisonnement avancé'] }], features: ['Chat', 'Vision', 'Deep Research', 'Operator', 'Accès API'] }
    ]
  },
  {
    id: 'claude', name: 'Claude', slug: 'claude', description: 'Assistant IA d\'Anthropic axé sur la sécurité et l\'éthique.',
    longDescription: 'Claude est l\'assistant IA d\'Anthropic...',
    logo: '/logos/claude.svg', url: 'https://claude.ai', categoryIds: ['chatbot'],
    aiModels: [
      { modelId: 'claude-3-opus', accessType: 'paid' },
      { modelId: 'claude-3-sonnet', accessType: 'free' },
      { modelId: 'claude-3-haiku', accessType: 'free' }
    ],
    pricing: 'freemium', priceDetails: 'Gratuit limité, Pro à 20$/mois',
    platforms: ['web', 'api'], functions: ['text', 'code', 'image'],
    rating: 4.6, reviewCount: 1523, usageCount: 85000, trendingScore: 92,
    createdAt: '2023-03-14', updatedAt: '2024-01-10', featured: true, hasApiTest: true,
    screenshots: ['/screenshots/claude-1.png'],
    status: 'active',
    benchmarks: { text: 93, code: 85, reasoning: 90, image: 75, audio: 65 },
    ownFeatures: ['Projects', 'Artifacts', 'Long context (200k)'],
    pricingPlans: [
      { name: 'Gratuit', price: 0, period: 'month', description: 'Accès limité', availableModels: [{ modelId: 'Claude 3 Sonnet', limits: 'Messages limités', features: ['Chat'] }], features: ['Chat'] },
      { name: 'Pro', price: 20, period: 'month', description: 'Accès prioritaire', availableModels: [{ modelId: 'Claude 3 Opus', limits: '5x plus de messages', features: ['Chat', 'Analyse de documents'] }, { modelId: 'Claude 3 Sonnet', limits: 'Illimité', features: ['Chat'] }], features: ['Chat', 'Projects', 'Artifacts'] }
    ]
  },
  {
    id: 'midjourney', name: 'Midjourney', slug: 'midjourney', description: 'Génération d\'images artistiques de haute qualité.',
    longDescription: 'Midjourney est un outil de génération d\'images...',
    logo: '/logos/midjourney.svg', url: 'https://midjourney.com', categoryIds: ['image'],
    aiModels: [{ modelId: 'midjourney-v6', accessType: 'paid' }],
    pricing: 'paid', priceDetails: 'À partir de 10$/mois',
    platforms: ['web'], functions: ['image'],
    rating: 4.8, reviewCount: 3421, usageCount: 120000, trendingScore: 95,
    createdAt: '2022-07-12', updatedAt: '2024-01-08', featured: true, hasApiTest: false,
    screenshots: ['/screenshots/midjourney-1.png', '/screenshots/midjourney-2.png'],
    status: 'active',
    benchmarks: { image: 98, creativity: 96, style_variety: 94 },
    ownFeatures: ['Upscaling', 'Inpainting', 'Style tuner'],
    pricingPlans: [
      { name: 'Basic', price: 10, period: 'month', description: '3.3h GPU / mois', features: ['Génération d\'images', 'Upscaling'] },
      { name: 'Standard', price: 30, period: 'month', description: '15h GPU / mois', features: ['Génération', 'Upscaling', 'Mode stealth'] },
      { name: 'Pro', price: 60, period: 'month', description: '30h GPU / mois', features: ['Tout inclus', 'Priorité'] }
    ]
  },
  {
    id: 'github-copilot', name: 'GitHub Copilot', slug: 'github-copilot', description: 'Assistant de programmation alimenté par l\'IA.',
    longDescription: 'GitHub Copilot est votre programmeur en binôme IA...',
    logo: '/logos/copilot.svg', url: 'https://github.com/features/copilot', categoryIds: ['code'],
    aiModels: [{ modelId: 'gpt-4', accessType: 'paid' }],
    pricing: 'paid', priceDetails: '10$/mois ou 100$/an',
    platforms: ['desktop', 'web'], functions: ['code'],
    rating: 4.5, reviewCount: 2156, usageCount: 95000, trendingScore: 88,
    createdAt: '2021-06-29', updatedAt: '2024-01-05', featured: true, hasApiTest: false,
    screenshots: ['/screenshots/copilot-1.png'],
    status: 'active',
    benchmarks: { code: 96, completion: 94, debugging: 88, security: 85 },
    ownFeatures: ['Multi-file editing', 'Copilot Chat', 'Copilot Voice'],
    pricingPlans: [
      { name: 'Individual', price: 10, period: 'month', features: ['Complétion de code', 'Chat', 'Sécurité'] },
      { name: 'Business', price: 19, period: 'month', features: ['Tout individual', 'Gestion centralisée'] },
      { name: 'Enterprise', price: 39, period: 'month', features: ['Tout business', 'Conformité'] }
    ]
  },
  {
    id: 'notion-ai', name: 'Notion AI', slug: 'notion-ai', description: 'Assistant IA intégré à Notion pour la productivité.',
    longDescription: 'Notion AI améliore votre espace de travail Notion...',
    logo: '/logos/notion.svg', url: 'https://notion.so/product/ai', categoryIds: ['productivity'],
    aiModels: [
      { modelId: 'gpt-4', accessType: 'paid' },
      { modelId: 'claude-3-sonnet', accessType: 'paid' }
    ],
    pricing: 'paid', priceDetails: '10$/membre/mois en plus de Notion',
    platforms: ['web', 'desktop', 'mobile'], functions: ['text'],
    rating: 4.4, reviewCount: 1876, usageCount: 78000, trendingScore: 82,
    createdAt: '2023-02-22', updatedAt: '2024-01-12', featured: false, hasApiTest: false,
    screenshots: ['/screenshots/notion-1.png'],
    status: 'active',
    benchmarks: { text: 85, productivity: 90, summarization: 88 },
    ownFeatures: ['Base de connaissances', 'Templates IA', 'Relecture intelligente'],
    pricingPlans: [
      { name: 'Plus', price: 10, period: 'month', description: 'Ajout à Notion Plus', features: ['IA intégrée', 'Limites généreuses'] },
      { name: 'Business', price: 15, period: 'month', description: 'Pour équipes', features: ['IA avancée', 'Sécurité'] }
    ]
  },
  {
    id: 'jasper', name: 'Jasper', slug: 'jasper', description: 'Plateforme de création de contenu marketing par IA.',
    longDescription: 'Jasper est une plateforme complète de création de contenu marketing...',
    logo: '/logos/jasper.svg', url: 'https://jasper.ai', categoryIds: ['writing'],
    aiModels: [
      { modelId: 'gpt-4', accessType: 'paid' },
      { modelId: 'claude-3-sonnet', accessType: 'paid' }
    ],
    pricing: 'paid', priceDetails: 'À partir de 49$/mois',
    platforms: ['web'], functions: ['text', 'image'],
    rating: 4.3, reviewCount: 1234, usageCount: 45000, trendingScore: 75,
    createdAt: '2021-01-15', updatedAt: '2024-01-08', featured: false, hasApiTest: false,
    screenshots: ['/screenshots/jasper-1.png'],
    status: 'pending',
    benchmarks: { text: 88, marketing: 92, seo: 86 },
    ownFeatures: ['Templates SEO', 'Mode Brand Voice', 'Chat Jasper'],
    pricingPlans: [
      { name: 'Creator', price: 49, period: 'month', features: ['Génération texte', 'Templates'] },
      { name: 'Pro', price: 69, period: 'month', features: ['Mode Business', 'API'] },
      { name: 'Business', price: 500, period: 'month', description: 'Sur mesure', features: ['Personnalisé'] }
    ]
  },
  {
    id: 'dall-e', name: 'DALL-E 3', slug: 'dall-e-3', description: 'Générateur d\'images par OpenAI.',
    longDescription: 'DALL-E 3 est le générateur d\'images d\'OpenAI...',
    logo: '/logos/dalle.svg', url: 'https://openai.com/dall-e-3', categoryIds: ['image', 'design'],
    aiModels: [{ modelId: 'dall-e-3', accessType: 'paid' }],
    pricing: 'paid', priceDetails: 'Inclus avec ChatGPT Plus ou via API',
    platforms: ['web', 'api'], functions: ['image'],
    rating: 4.6, reviewCount: 2098, usageCount: 89000, trendingScore: 90,
    createdAt: '2023-10-03', updatedAt: '2024-01-14', featured: true, hasApiTest: true,
    screenshots: ['/screenshots/dalle-1.png'],
    status: 'active',
    benchmarks: { image: 96, precision: 92, creative_editing: 88 },
    ownFeatures: ['Editing', 'Variations', 'Inpainting'],
    pricingPlans: [
      { name: 'ChatGPT Plus', price: 20, period: 'month', description: '50 images incluses', features: ['Génération', 'Chat'] },
      { name: 'API', price: 0.04, currency: 'USD', period: 'one-time', description: 'par image', features: ['API standard'] }
    ]
  },
  {
    id: 'elevenlabs', name: 'ElevenLabs', slug: 'elevenlabs', description: 'Synthèse vocale ultra-réaliste.',
    longDescription: 'ElevenLabs propose la synthèse vocale la plus réaliste...',
    logo: '/logos/elevenlabs.svg', url: 'https://elevenlabs.io', categoryIds: ['audio'],
    aiModels: [{ modelId: 'eleven-labs', accessType: 'freemium' }],
    pricing: 'freemium', priceDetails: 'Gratuit limité, à partir de 5$/mois',
    platforms: ['web', 'api'], functions: ['audio'],
    rating: 4.7, reviewCount: 1567, usageCount: 67000, trendingScore: 87,
    createdAt: '2023-01-24', updatedAt: '2024-01-11', featured: false, hasApiTest: true,
    screenshots: ['/screenshots/elevenlabs-1.png'],
    status: 'active',
    benchmarks: { audio: 94, voice_cloning: 97, emotion: 93 },
    ownFeatures: ['Voice Cloning', 'Studio d\'édition', 'Voix multilingues'],
    pricingPlans: [
      { name: 'Gratuit', price: 0, period: 'month', description: '10 000 caractères/mois', features: ['Synthèse basique'] },
      { name: 'Starter', price: 5, period: 'month', features: ['30k caractères', 'Voix personnalisées'] },
      { name: 'Creator', price: 22, period: 'month', features: ['100k caractères', 'Clonage voix'] },
      { name: 'Pro', price: 99, period: 'month', features: ['500k caractères', 'Usage commercial'] }
    ]
  },
  {
    id: 'perplexity', name: 'Perplexity AI', slug: 'perplexity-ai', description: 'Moteur de recherche conversationnel avec sources.',
    longDescription: 'Perplexity AI est un moteur de recherche alimenté par l\'IA...',
    logo: '/logos/perplexity.svg', url: 'https://perplexity.ai', categoryIds: ['research'],
    aiModels: [
      { modelId: 'gpt-4', accessType: 'paid' },
      { modelId: 'claude-3-opus', accessType: 'paid' },
      { modelId: 'gpt-3.5-turbo', accessType: 'free' }
    ],
    pricing: 'freemium', priceDetails: 'Gratuit avec limites, Pro à 20$/mois',
    platforms: ['web', 'mobile'], functions: ['text'],
    rating: 4.5, reviewCount: 1789, usageCount: 72000, trendingScore: 91,
    createdAt: '2022-08-30', updatedAt: '2024-01-13', featured: true, hasApiTest: false,
    screenshots: ['/screenshots/perplexity-1.png'],
    status: 'active',
    benchmarks: { text: 90, research: 93, citations: 95 },
    ownFeatures: ['Sources vérifiées', 'Focus academique', 'Mode pro'],
    pricingPlans: [
      { name: 'Gratuit', price: 0, period: 'month', features: ['Recherche simple', 'Limité'] },
      { name: 'Pro', price: 20, period: 'month', features: ['Modèles premium', 'Recherches illimitées', 'API'] }
    ]
  },
  {
    id: 'cursor', name: 'Cursor', slug: 'cursor', description: 'Éditeur de code avec IA intégrée.',
    longDescription: 'Cursor est un éditeur de code nouvelle génération...',
    logo: '/logos/cursor.svg', url: 'https://cursor.sh', categoryIds: ['code'],
    aiModels: [
      { modelId: 'gpt-4', accessType: 'paid' },
      { modelId: 'claude-3-opus', accessType: 'paid' }
    ],
    pricing: 'freemium', priceDetails: 'Gratuit avec limites, Pro à 20$/mois',
    platforms: ['desktop'], functions: ['code'],
    rating: 4.6, reviewCount: 987, usageCount: 54000, trendingScore: 93,
    createdAt: '2023-03-08', updatedAt: '2024-01-09', featured: true, hasApiTest: false,
    screenshots: ['/screenshots/cursor-1.png'],
    status: 'active',
    benchmarks: { code: 94, debugging: 89, completion: 92, refactoring: 87 },
    ownFeatures: ['Terminal intégré', 'Références de code', 'Workspace chat'],
    pricingPlans: [
      { name: 'Gratuit', price: 0, period: 'month', features: ['Éditeur de base', 'IA limitée'] },
      { name: 'Pro', price: 20, period: 'month', features: ['IA illimitée', 'Modèles premium', 'Terminal IA'] }
    ]
  },
  {
    id: 'runway', name: 'Runway', slug: 'runway', description: 'Suite créative pour la génération et l\'édition vidéo.',
    longDescription: 'Runway est une plateforme de création multimédia...',
    logo: '/logos/runway.svg', url: 'https://runway.ml', categoryIds: ['video'],
    aiModels: [{ modelId: 'stable-diffusion-xl', accessType: 'paid' }],
    pricing: 'freemium', priceDetails: 'Gratuit limité, Standard à 15$/mois',
    platforms: ['web'], functions: ['video', 'image'],
    rating: 4.4, reviewCount: 1123, usageCount: 48000, trendingScore: 85,
    createdAt: '2022-02-18', updatedAt: '2024-01-07', featured: false, hasApiTest: false,
    screenshots: ['/screenshots/runway-1.png'],
    status: 'active',
    benchmarks: { video: 90, image: 85, editing: 88, inpainting: 86 },
    ownFeatures: ['Génération vidéo', 'Suppression d\'objets', 'Motion tracking'],
    pricingPlans: [
      { name: 'Gratuit', price: 0, period: 'month', features: ['125 crédits', 'Export basse résolution'] },
      { name: 'Standard', price: 15, period: 'month', features: ['625 crédits', 'Haute qualité', 'Accès API'] },
      { name: 'Pro', price: 35, period: 'month', features: ['2250 crédits', 'Export 4K'] },
      { name: 'Unlimited', price: 95, period: 'month', features: ['Illimité', 'Priorité'] }
    ]
  },
  {
    id: 'copy-ai', name: 'Copy.ai', slug: 'copy-ai', description: 'Génération de contenu marketing et copywriting.',
    longDescription: 'Copy.ai vous aide à créer du contenu marketing percutant...',
    logo: '/logos/copyai.svg', url: 'https://copy.ai', categoryIds: ['writing', 'marketing'],
    aiModels: [{ modelId: 'gpt-4', accessType: 'paid' }],
    pricing: 'freemium', priceDetails: 'Gratuit avec 2000 mots/mois, Pro à 49$/mois',
    platforms: ['web'], functions: ['text'],
    rating: 4.2, reviewCount: 876, usageCount: 38000, trendingScore: 70,
    createdAt: '2020-10-05', updatedAt: '2024-01-06', featured: false, hasApiTest: false,
    screenshots: ['/screenshots/copyai-1.png'],
    status: 'pending',
    benchmarks: { text: 82, marketing: 85, copywriting: 88 },
    ownFeatures: ['Workflows', 'Infobase', 'Templates SEO'],
    pricingPlans: [
      { name: 'Gratuit', price: 0, period: 'month', features: ['2000 mots/mois', 'Templates basiques'] },
      { name: 'Pro', price: 49, period: 'month', features: ['Mots illimités', 'Tous templates', 'IA avancée'] },
      { name: 'Team', price: 79, period: 'month', description: 'par utilisateur', features: ['Collaboration', 'Support prioritaire'] }
    ]
  } */
];

// ---------- REVIEWS ----------
export const reviews: Review[] = [
  {
    id: 'rev-1', toolId: 'chatgpt', userId: 'user-1', userName: 'Marie Dupont', userAvatar: '/avatars/marie.jpg',
    rating: 5, comment: 'Excellent outil, je l\'utilise quotidiennement pour mon travail. La version GPT-4 est vraiment impressionnante pour les tâches complexes.',
    createdAt: '2024-01-10', replies: [{ id: 'reply-1', userId: 'user-2', userName: 'Pierre Martin', comment: 'Totalement d\'accord ! J\'ai aussi remarqué une grande amélioration avec GPT-4o.', createdAt: '2024-01-11' }]
  },
  {
    id: 'rev-2', toolId: 'chatgpt', userId: 'user-3', userName: 'Sophie Bernard', rating: 4,
    comment: 'Très bon outil mais parfois les réponses peuvent être un peu longues. La version gratuite est suffisante pour un usage occasionnel.',
    createdAt: '2024-01-08', replies: []
  },
  {
    id: 'rev-3', toolId: 'midjourney', userId: 'user-4', userName: 'Lucas Chen', userAvatar: '/avatars/lucas.jpg',
    rating: 5, comment: 'Incroyable pour la création artistique. Les résultats sont époustouflants et le style est unique.',
    createdAt: '2024-01-12', replies: []
  },
  {
    id: 'rev-4', toolId: 'cursor', userId: 'user-5', userName: 'Emma Wilson', rating: 5,
    comment: 'A révolutionné ma façon de coder. L\'intégration de l\'IA est fluide et les suggestions sont pertinentes.',
    createdAt: '2024-01-09', replies: []
  }
];

// ---------- USERS ----------
export const currentUser: User | null = null;
export const mockAdminUser: User = {
  id: 'admin-1', email: 'admin@aitools.com', name: 'Admin', avatar: '/avatars/admin.jpg', role: 'admin',
  createdAt: '2023-01-01', lastLogin: '2024-01-15', status: 'active', favorites: [], collections: []
};
export const mockRegularUser: User = {
  id: 'user-1', email: 'user@example.com', name: 'Marie Dupont', avatar: '/avatars/marie.jpg', role: 'user',
  createdAt: '2023-06-15', lastLogin: '2024-01-15', status: 'active', favorites: ['chatgpt', 'midjourney', 'cursor'],
  collections: [
    { id: 'col-1', name: 'Mes outils de dev', description: 'Outils que j\'utilise au quotidien pour le développement', toolIds: ['github-copilot', 'cursor', 'chatgpt'], createdAt: '2023-07-01' },
    { id: 'col-2', name: 'Création de contenu', toolIds: ['midjourney', 'dall-e', 'elevenlabs'], createdAt: '2023-08-15' }
  ]
};
export const mockUsers: User[] = [
  mockAdminUser, mockRegularUser,
  { id: 'user-2', email: 'pierre@example.com', name: 'Pierre Martin', role: 'user', createdAt: '2023-08-20', lastLogin: '2024-01-14', status: 'active', favorites: ['chatgpt', 'perplexity'], collections: [] },
  { id: 'user-3', email: 'sophie@example.com', name: 'Sophie Bernard', role: 'user', createdAt: '2023-09-10', lastLogin: '2024-01-10', status: 'active', favorites: ['midjourney', 'dall-e'], collections: [] },
  { id: 'user-4', email: 'lucas@example.com', name: 'Lucas Chen', avatar: '/avatars/lucas.jpg', role: 'user', createdAt: '2023-10-05', lastLogin: '2023-12-20', status: 'suspended', favorites: [], collections: [] }
];

// ---------- NOTIFICATIONS ----------
export const mockNotifications: Notification[] = [
  { id: 'notif-1', userId: 'user-1', type: 'tool_approved', title: 'Outil approuvé', message: 'Votre proposition d\'outil "MonOutilAI" a été approuvée et est maintenant visible.', read: false, createdAt: '2024-01-14', link: '/tools/mon-outil-ai' },
  { id: 'notif-2', userId: 'user-1', type: 'new_tool', title: 'Nouvel outil tendance', message: 'Découvrez "Cursor", le nouvel éditeur de code avec IA intégrée.', read: true, createdAt: '2024-01-12', link: '/tools/cursor' }
];

// ---------- PROPOSED TOOLS ----------
export const mockProposedTools: ProposedTool[] = [
  // Proposition 1 (en attente)
  {
    id: 'prop-1',
    userId: 'user-1',
    name: 'SuperAI Writer',
    description: 'Un outil révolutionnaire pour la rédaction automatisée.',
    url: 'https://superaiwriter.com',
    categoryId: 'writing',
    aiModels: [{ modelId: 'gpt-4', accessType: 'paid' }],
    pricing: 'freemium',
    priceDetails: 'Gratuit avec limites, Pro à 29$/mois',
    status: 'pending',
    createdAt: '2024-01-13'
  },
  // Proposition 2 (en attente)
  {
    id: 'prop-2',
    userId: 'user-1',
    name: 'CodeGenius',
    description: 'Assistant de code intelligent pour tous les langages.',
    url: 'https://codegenius.io',
    categoryId: 'code',
    aiModels: [
      { modelId: 'gpt-4', accessType: 'paid' },
      { modelId: 'claude-3-opus', accessType: 'paid' }
    ],
    pricing: 'paid',
    priceDetails: '15$/mois',
    status: 'pending',
    createdAt: '2024-01-12'
  },
  // Proposition 3 (approuvée)
  {
    id: 'prop-3',
    userId: 'user-1',
    name: 'Visionary AI',
    description: 'Génération et analyse d’images avancée.',
    longDescription: 'Visionary AI utilise des modèles de pointe pour générer, éditer et analyser des images.',
    logoUrl: 'https://visionary.ai/logo.png',
    url: 'https://visionary.ai',
    categoryId: 'image',
    newCategoryDesc: 'IA créative',
    releaseDate: '2024-03-15',
    isOpenSource: false,
    tags: [{ id: 'tag-4', name: 'Images' }, { id: 'tag-new', name: 'Génération', isNew: true }],
    platforms: ['Web', 'API', 'Desktop'],
    pricing: 'paid',
    priceDetails: 'À partir de 19€/mois',
    pricingType: 'paid',
    features: [
      { name: 'Génération haute résolution', description: 'Jusqu’à 4K' },
      { name: 'Édition par prompt' }
    ],
    performances: [
      { domain: 'Qualité d’image', score: 95, description: 'Très réaliste' },
      { domain: 'Vitesse', score: 88 }
    ],
    aiModels: [
      { modelId: 'dall-e-3', accessType: 'paid' },
      { modelId: 'stable-diffusion-xl', accessType: 'free' }
    ],
    models: [],
    pricingPlans: [],
    status: 'approved',
    createdAt: '2024-02-10',
    reviewedAt: '2024-02-15'
  },
  // Proposition 4 (approuvée complète)
  {
    id: 'prop-4',
    userId: 'user-1',
    name: 'TextCraft Pro',
    description: 'Assistant d’écriture avancé avec API.',
    longDescription: 'TextCraft Pro est une plateforme de génération et d’amélioration de contenu textuel.',
    logoUrl: 'https://textcraft.io/logo.png',
    url: 'https://textcraft.io',
    categoryId: 'writing',
    releaseDate: '2024-02-01',
    isOpenSource: false,
    tags: [{ id: 'tag-2', name: 'Génération texte' }, { id: 'tag-new-1', name: 'API', isNew: true }],
    platforms: ['Web', 'API'],
    pricing: 'freemium',
    priceDetails: 'Gratuit (limité) – Pro à 29$/mois',
    pricingType: 'freemium',
    features: [
      { name: 'Génération de texte' },
      { name: 'Résumé automatique' },
      { name: 'Traduction (100+ langues)' }
    ],
    performances: [
      { domain: 'Fluidité', score: 92 },
      { domain: 'Précision', score: 89 }
    ],
    aiModels: [
      { modelId: 'gpt-4o', accessType: 'paid' },
      { modelId: 'gpt-3.5-turbo', accessType: 'free' }
    ],
    models: [],
    pricingPlans: [],
    status: 'approved',
    createdAt: '2024-02-20',
    reviewedAt: '2024-02-25'
  },
  // Proposition 5 (en attente, incomplète)
  {
    id: 'prop-5',
    userId: 'user-1',
    name: 'Quick AI Tool',
    description: 'Un outil simple pour débuter.',
    url: 'https://quickai.com',
    categoryId: 'chatbot',
    aiModels: [{ modelId: 'gpt-3.5-turbo', accessType: 'free' }],
    pricing: 'free',
    status: 'pending',
    createdAt: '2024-03-01'
  },
  // Proposition 6 (refusée)
  {
    id: 'prop-6',
    userId: 'user-1',
    name: 'Minimal AI',
    description: 'Un outil minimaliste.',
    url: 'https://minimal.ai',
    categoryId: 'productivity',
    aiModels: [],
    pricing: 'free',
    status: 'rejected',
    createdAt: '2024-03-05',
    rejectionReason: 'Description trop vague. Veuillez fournir une description détaillée et des exemples d\'utilisation.'
  },
  // Proposition 7 (refusée)
  {
    id: 'prop-7',
    userId: 'user-1',
    name: 'DataMind',
    description: 'Analyse de données avec IA.',
    url: 'https://datamind.ai',
    categoryId: 'research',
    aiModels: [{ modelId: 'gpt-4', accessType: 'paid' }],
    pricing: 'paid',
    priceDetails: '49€/mois',
    status: 'rejected',
    createdAt: '2024-03-10',
    rejectionReason: 'Catégorie inappropriée. L\'outil semble plus adapté à la catégorie "Productivité". Veuillez corriger.',
    reviewedAt: '2024-03-12'
  }
];

// ---------- REPORTS ----------
export const mockReports: Report[] = [
  { id: 'rep-1', type: 'tool', targetId: 'jasper', userId: 'user-2', reason: 'outdated', details: 'Les tarifs indiqués ne sont plus à jour.', status: 'pending', createdAt: '2024-01-11' },
  { id: 'rep-2', type: 'comment', targetId: 'rev-2', userId: 'user-4', reason: 'spam', status: 'pending', createdAt: '2024-01-10' }
];

// ---------- DASHBOARD METRICS ----------
export const dashboardMetrics = {
  totalUsers: mockUsers.length,
  approvedTools: tools.filter(t => t.status === 'active').length,
  pendingTools: tools.filter(t => t.status === 'pending').length,
  pendingReports: mockReports.filter(r => r.status === 'pending').length,
  resolvedReportsThisWeek: mockReports.filter(r => r.status === 'resolved' && r.resolvedAt && new Date(r.resolvedAt).getTime() > Date.now() - 7 * 24 * 3600 * 1000).length,
  activeUsersToday: mockUsers.filter(u => u.lastLogin && new Date(u.lastLogin).toDateString() === new Date().toDateString()).length,
};

// ---------- HELPER FUNCTIONS ----------
export function getToolById(id: string): Tool | undefined {
  return tools.find(t => t.id === id || t.slug === id);
}
export function getToolsByCategory(categoryId: string): Tool[] {
  return tools.filter(t => t.categoryIds.includes(categoryId));
}
export function getToolsByModel(modelId: string): Tool[] {
  return tools.filter(t => t.aiModels.some(m => m.modelId === modelId));
}
export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id || c.slug === id);
}
export function getModelById(id: string): AIModel | undefined {
  return aiModels.find(m => m.id === id);
}
export function getReviewsByTool(toolId: string): Review[] {
  return reviews.filter(r => r.toolId === toolId);
}
export function getFeaturedTools(): Tool[] {
  return tools.filter(t => t.featured);
}
export function getTrendingTools(limit = 10): Tool[] {
  return [...tools].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, limit);
}
export function getTopRatedTools(limit = 10): Tool[] {
  return [...tools].sort((a, b) => b.rating - a.rating).slice(0, limit);
}
export function getMostUsedTools(limit = 10): Tool[] {
  return [...tools].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
}
export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase();
  return tools.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.longDescription.toLowerCase().includes(lowerQuery)
  );
}
export function filterTools(filters: {
  category?: string;
  pricing?: string[];
  platforms?: string[];
  functions?: string[];
  models?: string[];
  sortBy?: 'rating' | 'usage' | 'trending' | 'recent';
}): Tool[] {
  let result = [...tools];
  if (filters.category) result = result.filter(t => t.categoryIds.includes(filters.category!));
  if (filters.pricing?.length) result = result.filter(t => filters.pricing!.includes(t.pricing));
  if (filters.platforms?.length) result = result.filter(t => t.platforms.some(p => filters.platforms!.includes(p)));
  if (filters.functions?.length) result = result.filter(t => t.functions.some(f => filters.functions!.includes(f)));
  if (filters.models?.length) result = result.filter(t => t.aiModels.some(m => filters.models!.includes(m.modelId)));
  switch (filters.sortBy) {
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    case 'usage': result.sort((a, b) => b.usageCount - a.usageCount); break;
    case 'trending': result.sort((a, b) => b.trendingScore - a.trendingScore); break;
    case 'recent': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
  }
  return result;
}