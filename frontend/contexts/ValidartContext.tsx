import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CircleFeature {
  id: string;
  type: 'circle';
  x: number; // center x in mm
  y: number; // center y in mm
  r: number; // radius in mm
}

export interface SlotFeature {
  id: string;
  type: 'slot';
  x: number; // center x in mm
  y: number; // center y in mm
  width: number; // in mm
  height: number; // in mm
}

export type Feature = CircleFeature | SlotFeature;

export interface ValidartState {
  artwork: string | null;
  artworkFile: File | null;
  artworkOffsetX: number; // artwork offset in mm
  artworkOffsetY: number; // artwork offset in mm
  cardWidth: number;
  cardHeight: number;
  roundedCorners: boolean;
  features: Feature[];
  canvasWidth: number;
  canvasHeight: number;
  canvasScale: number; // pixels per mm
  isDragging: boolean;
  isResizing: boolean;
  dragTarget: any;
  lastMousePos: { x: number; y: number };
  banner: { message: string; type: 'success' | 'danger' | 'warning' } | null;
  trimDistance: number; // distance from edge in mm
  bleedDistance: number; // distance from edge in mm
}

type ValidartAction =
  | { type: 'SET_ARTWORK'; payload: { artwork: string; file: File } }
  | { type: 'SET_ARTWORK_OFFSET'; payload: { x: number; y: number } }
  | { type: 'SET_CARD_DIMENSIONS'; payload: { width: number; height: number } }
  | { type: 'SET_ROUNDED_CORNERS'; payload: boolean }
  | { type: 'ADD_FEATURE'; payload: Feature }
  | { type: 'UPDATE_FEATURE'; payload: { id: string; updates: Partial<Feature> } }
  | { type: 'REMOVE_FEATURE'; payload: string }
  | { type: 'CLEAR_FEATURES' }
  | { type: 'SET_CANVAS_DIMENSIONS'; payload: { width: number; height: number; scale: number } }
  | { type: 'SET_DRAGGING'; payload: { isDragging: boolean; dragTarget?: any } }
  | { type: 'SET_RESIZING'; payload: boolean }
  | { type: 'SET_LAST_MOUSE_POS'; payload: { x: number; y: number } }
  | { type: 'SET_BANNER'; payload: { message: string; type: 'success' | 'danger' | 'warning' } | null }
  | { type: 'SET_TRIM_DISTANCE'; payload: number }
  | { type: 'SET_BLEED_DISTANCE'; payload: number }
  | { type: 'RESET_STATE' };

const initialState: ValidartState = {
  artwork: null,
  artworkFile: null,
  artworkOffsetX: 0,
  artworkOffsetY: 0,
  cardWidth: 101.6, // 4 inches
  cardHeight: 139.7, // 5.5 inches
  roundedCorners: true,
  features: [],
  canvasWidth: 400,
  canvasHeight: 250,
  canvasScale: 1,
  isDragging: false,
  isResizing: false,
  dragTarget: null,
  lastMousePos: { x: 0, y: 0 },
  banner: null,
  trimDistance: 0.5, // Default trim distance for PVC cards
  bleedDistance: 2.0, // Default bleed distance for PVC cards
};

function validartReducer(state: ValidartState, action: ValidartAction): ValidartState {
  switch (action.type) {
    case 'SET_ARTWORK':
      return {
        ...state,
        artwork: action.payload.artwork,
        artworkFile: action.payload.file,
        artworkOffsetX: 0,
        artworkOffsetY: 0,
      };
    case 'SET_ARTWORK_OFFSET':
      return {
        ...state,
        artworkOffsetX: action.payload.x,
        artworkOffsetY: action.payload.y,
      };
    case 'SET_CARD_DIMENSIONS':
      return {
        ...state,
        cardWidth: action.payload.width,
        cardHeight: action.payload.height,
      };
    case 'SET_ROUNDED_CORNERS':
      return {
        ...state,
        roundedCorners: action.payload,
      };
    case 'ADD_FEATURE':
      return {
        ...state,
        features: [...state.features, action.payload],
      };
    case 'UPDATE_FEATURE':
      return {
        ...state,
        features: state.features.map(feature =>
          feature.id === action.payload.id
            ? { ...feature, ...action.payload.updates }
            : feature
        ),
      };
    case 'REMOVE_FEATURE':
      return {
        ...state,
        features: state.features.filter(feature => feature.id !== action.payload),
      };
    case 'CLEAR_FEATURES':
      return {
        ...state,
        features: [],
      };
    case 'SET_CANVAS_DIMENSIONS':
      return {
        ...state,
        canvasWidth: action.payload.width,
        canvasHeight: action.payload.height,
        canvasScale: action.payload.scale,
      };
    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.payload.isDragging,
        dragTarget: action.payload.dragTarget || null,
      };
    case 'SET_RESIZING':
      return {
        ...state,
        isResizing: action.payload,
      };
    case 'SET_LAST_MOUSE_POS':
      return {
        ...state,
        lastMousePos: action.payload,
      };
    case 'SET_BANNER':
      return {
        ...state,
        banner: action.payload,
      };
    case 'SET_TRIM_DISTANCE':
      return {
        ...state,
        trimDistance: action.payload,
      };
    case 'SET_BLEED_DISTANCE':
      return {
        ...state,
        bleedDistance: action.payload,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const ValidartContext = createContext<{
  state: ValidartState;
  dispatch: React.Dispatch<ValidartAction>;
} | null>(null);

export function ValidartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(validartReducer, initialState);

  return (
    <ValidartContext.Provider value={{ state, dispatch }}>
      {children}
    </ValidartContext.Provider>
  );
}

export function useValidart() {
  const context = useContext(ValidartContext);
  if (!context) {
    throw new Error('useValidart must be used within a ValidartProvider');
  }
  return context;
}
