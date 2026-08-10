export type BuilderTitle =
  | "Big hunter"
  | "Frontend Captain"
  | "Backend blacksmith"
  | "Neural navigator"
  | "Stack surfer"
  | "Full stack flamingo"
  | "Night owl builder"
  | "Coffee compiler"
  | "Data Dreamer"
  | "Agent Tamer";

export type BuilderFrame = "SIGNAL" | "ON-CHAIN" | "COASTAL CIRCUIT";

export const FRAME_ASSETS: Record<BuilderFrame, string> = {
  SIGNAL: "Signal.png",
  "ON-CHAIN": "ON-CHAIN.png",
  "COASTAL CIRCUIT": "Coastal Circuit.png",
};

export const FRAME_BADGES: Record<BuilderFrame, string> = {
  SIGNAL: "Signal_com.png",
  "ON-CHAIN": "ON-CHAIN_com.png",
  "COASTAL CIRCUIT": "COASTAL_CIRCUIT_com.png",
};

export type BuilderFormData = {
  name: string;
  roles: string[];
  title: BuilderTitle | "";
  frame: BuilderFrame;
};

export type PhotoAdjustments = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};
