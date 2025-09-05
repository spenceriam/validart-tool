import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface PunchHole {
  id: string;
  x: number;
  y: number;
  r: number;
}

export interface ValidartState {
  artwork: string | null;
  artworkFile: File | null;
  cardWidth: number;
  cardHeight: number;
  safeZonePercent: number;
  roundedCorners: boolean;
  punchHoles: PunchHole[];
  canvasWidth: number;
  canvasHeight: number;
  canvasScale: number;
  isDragging: boolean;
  isResizing: boolean;
  dragTarget: any;
  lastMousePos: { x: number; y: number };
  banner: { message: string; type: 'success' | 'danger' | 'warning' } | null;
}

type ValidartAction =
  | { type: 'SET_ARTWORK'; payload: { artwork: string; file: File } }
  | { type: 'SET_CARD_DIMENSIONS'; payload: { width: number; height: number } }
  | { type: 'SET_SAFE_ZONE'; payload: number }
  | { type: 'SET_ROUNDED_CORNERS'; payload: boolean }
  | { type: 'ADD_PUNCH_HOLE'; payload: PunchHole }
  | { type: 'UPDATE_PUNCH_HOLE'; payload: { id: string; updates: Partial<PunchHole> } }
  | { type: 'REMOVE_PUNCH_HOLE'; payload: string }
  | { type: 'CLEAR_PUNCH_HOLES' }
  | { type: 'SET_CANVAS_DIMENSIONS'; payload: { width: number; height: number; scale: number } }
  | { type: 'SET_DRAGGING'; payload: { isDragging: boolean; dragTarget?: any } }
  | { type: 'SET_RESIZING'; payload: boolean }
  | { type: 'SET_LAST_MOUSE_POS'; payload: { x: number; y: number } }
  | { type: 'SET_BANNER'; payload: { message: string; type: 'success' | 'danger' | 'warning' } | null }
  | { type: 'RESET_STATE' };

const initialState: ValidartState = {
  artwork: null,
  artworkFile: null,
  cardWidth: 101.6,
  cardHeight: 139.4,
  safeZonePercent: 12,
  roundedCorners: false,
  punchHoles: [],
  canvasWidth: 400,
  canvasHeight: 250,
  canvasScale: 1,
  isDragging: false,
  isResizing: false,
  dragTarget: null,
  lastMousePos: { x: 0, y: 0 },
  banner: null,
};

function validartReducer(state: ValidartState, action: ValidartAction): ValidartState {
  switch (action.type) {
    case 'SET_ARTWORK':
      return {
        ...state,
        artwork: action.payload.artwork,
        artworkFile: action.payload.file,
      };
    case 'SET_CARD_DIMENSIONS':
      return {
        ...state,
        cardWidth: action.payload.width,
        cardHeight: action.payload.height,
      };
    case 'SET_SAFE_ZONE':
      return {
        ...state,
        safeZonePercent: action.payload,
      };
    case 'SET_ROUNDED_CORNERS':
      return {
        ...state,
        roundedCorners: action.payload,
      };
    case 'ADD_PUNCH_HOLE':
      return {
        ...state,
        punchHoles: [...state.punchHoles, action.payload],
      };
    case 'UPDATE_PUNCH_HOLE':
      return {
        ...state,
        punchHoles: state.punchHoles.map(hole =>
          hole.id === action.payload.id ? { ...hole, ...action.payload.updates } : hole
        ),
      };
    case 'REMOVE_PUNCH_HOLE':
      return {
        ...state,
        punchHoles: state.punchHoles.filter(hole => hole.id !== action.payload),
      };
    case 'CLEAR_PUNCH_HOLES':
      return {
        ...state,
        punchHoles: [],
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
