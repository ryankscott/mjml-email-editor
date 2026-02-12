import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { TemplateInput } from "@/lib/templates";
import { templateStore } from "@/lib/templateStore";

export const templatesQueryKey = ["templates"] as const;

export function useTemplatesQuery() {
  return useQuery({
    queryKey: templatesQueryKey,
    queryFn: () => templateStore.list(),
  });
}

export function useTemplateMutations() {
  const queryClient = useQueryClient();

  const invalidateTemplates = () =>
    queryClient.invalidateQueries({ queryKey: templatesQueryKey });

  const createTemplateMutation = useMutation({
    mutationFn: (input: TemplateInput) => templateStore.create(input),
    onSuccess: invalidateTemplates,
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TemplateInput }) =>
      templateStore.update(id, input),
    onSuccess: invalidateTemplates,
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templateStore.delete(id),
    onSuccess: invalidateTemplates,
  });

  return {
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
}
