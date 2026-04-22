import { SprintResponse } from "@/models/Sprint";
import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import { getSprint } from "@/services/sprint/getSprint";
import { useQuery } from "@tanstack/react-query";

export const useGetSprint = (sprintId: string) => {
  return useQuery<ResponseDetailSuccess<SprintResponse>>({
    queryKey: ["sprint", sprintId],
    queryFn: () => getSprint(sprintId),
    enabled: !!sprintId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};
