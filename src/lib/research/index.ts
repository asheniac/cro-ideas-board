export { generateCROIdeas } from "./generator";
export type { GeneratedCROIdea, GenerateOptions, LLMClient } from "./generator";
export { createMockLLMClient } from "./mock-llm";
export { buildSystemPrompt, buildUserPrompt } from "./prompts";
export {
  PAGE_TYPES,
  COMPONENTS,
  CRO_CATEGORIES,
  SAMSUNG_CONTEXT,
  BEST_PRACTICES,
  OPPORTUNITY_ZONES,
} from "./knowledge-base";
