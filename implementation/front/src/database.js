// Donnees simulees pour travailler sans backend.
// Plus tard avec PHP:
// 1. Remplacer ces tableaux par des appels fetch.
// 2. Exemple:
//    fetch("http://localhost/aifinder/api/outils.php")
//      .then(res => res.json())
//      .then(data => setTools(data));
// 3. Les ajouts/modifications devront utiliser fetch avec method: "POST", "PUT" ou "DELETE".

export const currentUser = {
  id: 1,
  nom: "Amine",
  prenom: "Maker",
  email: "amine@aifinder.dev",
  role: "admin",
  statut: "Actif",
  avatar: "AM"
};

export const toolsData = [
  {
    id: 1,
    name: "ChatGPT",
    icon: "C",
    category: "Assistant general",
    description: "Assistant multimodal pour redaction, analyse, code, image, voix et automatisation legere.",
    pricing: "Freemium",
    score: 96,
    rating: 5,
    reviews: 5600,
    status: "Verifie",
    tags: ["chatbot", "multimodal", "API"],
    api: "Oui",
    fav: true,
    featured: true,
    provider: "OpenAI",
    platform: "Web, API",
    licence: "Proprietaire",
    created_at: "2026-04-18"
  },
  {
    id: 2,
    name: "Claude",
    icon: "Cl",
    category: "Texte & Code",
    description: "Assistant IA fort sur raisonnement, redaction longue, synthese documentaire et code.",
    pricing: "Freemium",
    score: 93,
    rating: 5,
    reviews: 3100,
    status: "Verifie",
    tags: ["long context", "docs", "code"],
    api: "Oui",
    fav: false,
    featured: true,
    provider: "Anthropic",
    platform: "Web, API",
    licence: "Proprietaire",
    created_at: "2026-04-12"
  },
  {
    id: 3,
    name: "Cursor",
    icon: "Cu",
    category: "Code & DevOps",
    description: "IDE assiste par IA pour comprendre une codebase et modifier plusieurs fichiers.",
    pricing: "Freemium",
    score: 94,
    rating: 5,
    reviews: 2800,
    status: "Publie",
    tags: ["IDE", "agent", "code"],
    api: "Non",
    fav: true,
    featured: true,
    provider: "Cursor",
    platform: "Desktop",
    licence: "Proprietaire",
    created_at: "2026-04-18"
  },
  {
    id: 4,
    name: "Perplexity",
    icon: "P",
    category: "Recherche",
    description: "Moteur de reponse IA avec citations, recherche web et collections de sources.",
    pricing: "Freemium",
    score: 91,
    rating: 4,
    reviews: 1900,
    status: "A revalider",
    tags: ["search", "citations", "veille"],
    api: "Oui",
    fav: false,
    featured: false,
    provider: "Perplexity",
    platform: "Web, Mobile",
    licence: "Proprietaire",
    created_at: "2026-04-09"
  },
  {
    id: 5,
    name: "Runway",
    icon: "R",
    category: "Video",
    description: "Generation et edition video assistees par IA pour equipes creatives.",
    pricing: "Freemium",
    score: 89,
    rating: 4,
    reviews: 1200,
    status: "Signale",
    tags: ["video", "editing", "creative"],
    api: "Oui",
    fav: false,
    featured: false,
    provider: "Runway",
    platform: "Web",
    licence: "Proprietaire",
    created_at: "2026-04-02"
  },
  {
    id: 6,
    name: "ElevenLabs",
    icon: "E",
    category: "Audio & Voix",
    description: "Voix synthetiques, doublage, clonage vocal et generation audio professionnelle.",
    pricing: "Freemium",
    score: 90,
    rating: 5,
    reviews: 980,
    status: "Verifie",
    tags: ["TTS", "voice", "dubbing"],
    api: "Oui",
    fav: true,
    featured: false,
    provider: "ElevenLabs",
    platform: "Web, API",
    licence: "Proprietaire",
    created_at: "2026-03-28"
  }
];

export const userProposalsData = [
  {
    id: 101,
    name: "PromptLayer",
    category: "LLMOps",
    pricing: "Freemium",
    score: 71,
    status: "En attente",
    adminNote: "Verification Models.type et api_url.",
    description: "Observabilite de prompts et versions LLM.",
    tags: ["llmops", "prompt"],
    fav: false
  },
  {
    id: 102,
    name: "MagicBrief",
    category: "Marketing",
    pricing: "Payant",
    score: 92,
    status: "Accepte",
    adminNote: "Publie dans Marketing & Ads.",
    description: "Analyse de creatifs publicitaires et briefs.",
    tags: ["ads", "brief"],
    fav: false
  },
  {
    id: 103,
    name: "CopyForge",
    category: "Redaction & SEO",
    pricing: "Freemium",
    score: 43,
    status: "Refuse",
    adminNote: "Description trop promotionnelle, absence URL officielle.",
    description: "Generation de textes marketing.",
    tags: ["seo", "copywriting"],
    fav: false
  }
];

export const reportsData = [
  { id: "SIG-2401", tool: "Runway", issue: "Lien pricing casse", priority: "Haute", status: "Ouvert" },
  { id: "SIG-2402", tool: "Perplexity", issue: "Modele API a actualiser", priority: "Moyenne", status: "Assigne" },
  { id: "SIG-2403", tool: "ImageFlow", issue: "Categorie incorrecte", priority: "Basse", status: "Resolu" }
];

export const commentsData = [
  { id: 1, tool: "Cursor", author: "Amine", text: "Tres utile pour refactor, mais il faut relire les modifications sensibles.", rating: 5, likes: 18, status: "Publie" },
  { id: 2, tool: "Claude", author: "Sara", text: "Excellent pour synthese longue et redaction structuree.", rating: 5, likes: 12, status: "Publie" },
  { id: 3, tool: "Runway", author: "Yanis", text: "Bon resultat video, pricing difficile a suivre.", rating: 4, likes: 7, status: "A verifier" }
];

export const adminProposalsData = [
  { id: 201, name: "PromptLayer", category: "LLMOps", author: "Amine", score: 71, description: "Observabilite de prompts, logs, versions et evaluation de sorties LLM.", flags: ["Models.type incomplet", "api_url a verifier"] },
  { id: 202, name: "DataPilot", category: "Donnees", author: "Sara", score: 38, description: "Assistant analyse de datasets avec tableaux de bord generes automatiquement.", flags: ["doublon probable", "slug similaire"] },
  { id: 203, name: "VoiceClone Pro", category: "Audio & Voix", author: "Nora", score: 66, description: "Clonage vocal et doublage pour contenus educatifs.", flags: ["risque legal", "preuve consentement manquante"] }
];

export const usersData = [
  { id: 1, name: "Amine Maker", email: "amine@aifinder.dev", role: "Utilisateur", status: "Actif", lastLogin: "2026-05-04" },
  { id: 2, name: "Sara Data", email: "sara@aifinder.dev", role: "Curateur", status: "Actif", lastLogin: "2026-05-04" },
  { id: 3, name: "Yanis Studio", email: "yanis@aifinder.dev", role: "Utilisateur", status: "Suspendu", lastLogin: "2026-05-01" }
];

export const categoriesData = [
  "Assistant general",
  "Code & DevOps",
  "Redaction & SEO",
  "Video",
  "Audio & Voix",
  "Donnees",
  "Automatisation",
  "Recherche"
];

export const collectionsData = [
  { id: 1, name: "Outils code", description: "Collection d'outils de developpement.", created_at: "2026-05-04", tool: "Cursor" },
  { id: 2, name: "Recherche IA", description: "Collection pour recherche et synthese.", created_at: "2026-05-04", tool: "Perplexity" }
];

export const requestsData = [
  { id: 1, title: "Correction categorie", message: "Deplacer Cursor vers Code & DevOps.", status: "Ouvert", created_at: "2026-05-04" },
  { id: 2, title: "Suppression doublon", message: "Verifier une fiche dupliquee.", status: "En analyse", created_at: "2026-05-04" }
];

export const notificationsData = [
  { id: 1, target: "utilisateur", type: "soumission", title: "Soumission recue", message: "PromptLayer est en attente de validation.", created_at: "2026-05-04" },
  { id: 2, target: "utilisateur", type: "signalement", title: "Signalement ouvert", message: "Runway est en analyse.", created_at: "2026-05-04" }
];

export const historyData = [
  "Recherche: agent IA pour tests Laravel",
  "Favori ajoute: Cursor",
  "Commentaire publie sur Claude",
  "Signalement envoye: Runway"
];
