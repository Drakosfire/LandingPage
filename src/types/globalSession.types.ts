// Global Session Types for Frontend Integration
// Mirrors backend models from DungeonMindServer/models/

export interface GlobalSessionPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    autoSave: boolean;
    notifications: boolean;
    defaultVisibility: 'private' | 'friends' | 'public';
}

export interface CardGeneratorSessionState {
    currentProjectId?: string;
    currentStepId: string;
    stepCompletion: Record<string, boolean>;
    itemDetails: {
        name: string;
        type: string;
        rarity: string;
        value: string;
        properties: string[];
        damageFormula: string;
        damageType: string;
        weight: string;
        description: string;
        quote: string;
        sdPrompt: string;
    };
    selectedAssets: {
        finalImage?: string;
        border?: string;
        seedImage?: string;
        generatedCardImages: string[];
        selectedGeneratedCardImage?: string;
        finalCardWithText?: string;
    };
    generatedContent: {
        images: string[];
        renderedCards: string[];
    };
    autoSaveEnabled: boolean;
    lastSaved?: string;
}

export interface StoreGeneratorSessionState {
    currentStoreId?: string;
    storeType: string;
    currentSection: string;
    generatedSections: Record<string, any>;
    selectedItems: string[];
    storeMetadata: Record<string, any>;
}

export interface RulesLawyerSessionState {
    currentQuery?: string;
    chatHistory: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
    }>;
    selectedEmbedding: string;
    bookmarks: string[];
    searchFilters: Record<string, any>;
}

export interface EnhancedGlobalSession {
    session_id: string;
    user_id?: string;
    created_at: string;
    last_accessed: string;
    expires_at: string;

    // Tool States
    cardgenerator?: CardGeneratorSessionState;
    storegenerator?: StoreGeneratorSessionState;
    ruleslawyer?: RulesLawyerSessionState;

    // Cross-tool features
    active_world_id?: string;
    active_project_id?: string;
    clipboard: string[]; // Object IDs
    recently_viewed: string[]; // Object IDs

    // Global preferences
    preferences: GlobalSessionPreferences;
}

export interface DungeonMindObject {
    id: string;
    type: 'item' | 'store' | 'statblock' | 'rule' | 'spell' | 'world' | 'project';
    createdBy: string;
    ownedBy: string;
    worldId?: string;
    projectId?: string;
    name: string;
    description: string;
    tags: string[];
    visibility: 'private' | 'friends' | 'public';
    sharedWith: string[];
    permissions: {
        canRead: string[];
        canWrite: string[];
        canAdmin: string[];
    };
    version: number;
    itemData?: {
        itemType: string;
        rarity: string;
        value?: string;
        weight?: string;
        properties: string[];
        damageFormula?: string;
        damageType?: string;
        magicalProperties?: string[];
    };
    createdAt: string;
    updatedAt: string;
}

// API Request/Response Types
export interface CreateSessionRequest {
    platform?: string;
    user_id?: string;
}

export interface CreateSessionResponse {
    session_id: string;
    session: EnhancedGlobalSession;
}

export interface RestoreSessionResponse {
    found: boolean;
    session?: EnhancedGlobalSession;
}

export interface UpdateToolStateRequest {
    tool_name: string;
    state: CardGeneratorSessionState | StoreGeneratorSessionState | RulesLawyerSessionState;
}

export interface CreateObjectRequest {
    type: DungeonMindObject['type'];
    name: string;
    description: string;
    itemData?: DungeonMindObject['itemData'];
    worldId?: string;
    projectId?: string;
    visibility?: DungeonMindObject['visibility'];
    tags?: string[];
}

export interface ObjectSearchRequest {
    query?: string;
    type?: DungeonMindObject['type'];
    worldId?: string;
    projectId?: string;
    tags?: string[];
    visibility?: DungeonMindObject['visibility'];
    limit?: number;
    offset?: number;
} 