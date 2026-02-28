'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(1, { message: "Project title cannot be empty." }),
  stage: z.enum(["spark", "literature", "deep-dive", "writing", "review"]),
});

type ProjectEditFormValues = z.infer<typeof formSchema>;

interface ProjectEditDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectEditDialog({ project, open, onOpenChange }: ProjectEditDialogProps) {
  const updateProject = useProjectStore((state) => state.updateProject);
  const { toast } = useToast();

  const form = useForm<ProjectEditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project.title,
      stage: project.stage,
    },
  });

  async function onSubmit(values: ProjectEditFormValues) {
    updateProject(project.id, values);
    onOpenChange(false);
    toast({
      title: "Project Updated!",
      description: `Project \"${values.title}\" has been successfully updated.`, // Corrected escaping for "
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to your project here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
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
                      <SelectTrigger className="w-full">
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
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
