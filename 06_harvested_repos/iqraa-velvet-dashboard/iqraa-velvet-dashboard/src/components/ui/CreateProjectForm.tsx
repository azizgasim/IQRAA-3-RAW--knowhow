'use client';

import { useProjectStore } from '@/store/projectStore';
import { Button } from './button';
import { Input } from './input';
import { useToast } from './use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from '@/types';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useActivityStore } from '@/store/activityStore';

const formSchema = z.object({
  title: z.string().min(1, { message: "Project title cannot be empty." }),
  stage: z.enum(["spark", "literature", "deep-dive", "writing", "review"]),
});

type CreateProjectFormValues = z.infer<typeof formSchema>;

export function CreateProjectForm() {
  const addProject = useProjectStore((state) => state.addProject);
  const addActivity = useActivityStore((state) => state.addActivity);
  const { toast } = useToast();

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      stage: "spark",
    },
  });

  async function onSubmit(values: CreateProjectFormValues) {
    await addProject({ title: values.title, stage: values.stage });
    form.reset();
    toast({
      title: "Project Created!",
      description: `Your project \"${values.title}\" has been successfully created.`,
    });
    addActivity({
      type: 'project_created',
      description: `Project \"${values.title}\" was created.`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter project title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Stage</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="spark">Spark</SelectItem>
                  <SelectItem value="literature">Literature</SelectItem>
                  <SelectItem value="deep-dive">Deep-Dive</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Project</Button>
      </form>
    </Form>
  );
}
