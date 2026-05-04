import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { Prompt, Tool, TaskType } from "../lib/types";

const TOOLS: Tool[] = [
  "cursor",
  "claude-code",
  "copilot",
  "chatgpt",
  "aider",
  "other",
];
const TASK_TYPES: TaskType[] = [
  "refactor",
  "scaffold",
  "debug",
  "test",
  "review",
  "explain",
  "rules",
  "other",
];

const TOOL_LABELS: Record<Tool, string> = {
  cursor: "Cursor",
  "claude-code": "Claude Code",
  copilot: "GitHub Copilot",
  chatgpt: "ChatGPT",
  aider: "Aider",
  other: "Other",
};

const TASK_LABELS: Record<TaskType, string> = {
  refactor: "Refactor",
  scaffold: "Scaffold",
  debug: "Debug",
  test: "Test",
  review: "Code review",
  explain: "Explain",
  rules: "Rules / system prompt",
  other: "Other",
};

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Prompt body is required").max(20_000),
  description: z.string().max(1000).optional(),
  tool: z.enum(TOOLS as [Tool, ...Tool[]]),
  taskType: z.enum(TASK_TYPES as [TaskType, ...TaskType[]]),
  stackInput: z.string().optional(), // comma-separated, parsed on submit
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export type PromptFormSubmitData = {
  title: string;
  body: string;
  description?: string;
  tool: Tool;
  taskType: TaskType;
  stack: string[];
  isPublic: boolean;
};

type PromptFormProps = {
  defaultValues?: Partial<Prompt>;
  onSubmit: (data: PromptFormSubmitData) => Promise<void> | void;
  submitting?: boolean;
};

export function PromptForm({
  defaultValues,
  onSubmit,
  submitting,
}: PromptFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      body: defaultValues?.body ?? "",
      description: defaultValues?.description ?? "",
      tool: defaultValues?.tool ?? "cursor",
      taskType: defaultValues?.taskType ?? "rules",
      stackInput: defaultValues?.stack?.join(", ") ?? "",
      isPublic: defaultValues?.isPublic ?? false,
    },
  });

  const tool = watch("tool");
  const taskType = watch("taskType");
  const isPublic = watch("isPublic");

  const submit = handleSubmit(async (values) => {
    const stack = (values.stackInput ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    await onSubmit({
      title: values.title,
      body: values.body,
      description: values.description,
      tool: values.tool,
      taskType: values.taskType,
      stack,
      isPublic: values.isPublic,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Cursor rules for Next.js App Router"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Prompt</Label>
        <Textarea
          id="body"
          placeholder="Paste your prompt, rules file, or context block here..."
          rows={14}
          className="font-mono text-sm"
          {...register("body")}
        />
        {errors.body && (
          <p className="text-sm text-red-500">{errors.body.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Why this works, when to use it..."
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tool</Label>
          <Select
            value={tool}
            onValueChange={(v) => setValue("tool", v as Tool)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOOLS.map((t) => (
                <SelectItem key={t} value={t}>
                  {TOOL_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Task type</Label>
          <Select
            value={taskType}
            onValueChange={(v) => setValue("taskType", v as TaskType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TASK_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stackInput">Stack (comma-separated)</Label>
        <Input
          id="stackInput"
          placeholder="nextjs, typescript, tailwind"
          {...register("stackInput")}
        />
        <p className="text-xs text-muted-foreground">
          Tags help others find your prompt in Explore.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="isPublic" className="text-base">
            Make public
          </Label>
          <p className="text-sm text-muted-foreground">
            Public prompts appear in Explore and can be forked by anyone.
          </p>
        </div>
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(v) => setValue("isPublic", v)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save prompt"}
        </Button>
      </div>
    </form>
  );
}
