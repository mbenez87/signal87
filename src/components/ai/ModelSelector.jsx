import { Bot, Sparkles, Zap, Globe } from 'lucide-react';
import { Select, SelectItem } from '../ui';

export const models = [
  {
    id: "ARIA",
    name: "ARIA",
    provider: "Signal87",
    description: "Document intelligence specialist",
    icon: Bot
  },
  {
    id: "gpt",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "General purpose AI",
    icon: Sparkles
  },
  {
    id: "claude",
    name: "Claude 4.5",
    provider: "Anthropic",
    description: "Deep reasoning & analysis",
    icon: Zap
  },
  {
    id: "perplexity",
    name: "Perplexity Sonar",
    provider: "Perplexity",
    description: "Web search & real-time data",
    icon: Globe
  }
];

export function ModelSelector({ selectedModel, onModelChange, className }) {
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className={className}>
      <Select value={selectedModel} onValueChange={onModelChange}>
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{model.name}</span>
                <span className="text-xs text-gray-500">({model.provider})</span>
              </div>
            </SelectItem>
          );
        })}
      </Select>
      {currentModel && (
        <p className="text-xs text-gray-500 mt-1">{currentModel.description}</p>
      )}
    </div>
  );
}
