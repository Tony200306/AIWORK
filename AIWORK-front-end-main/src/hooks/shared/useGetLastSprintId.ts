import { LastSprintResponse } from "@/models/Sprint";
import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import { getLastSprintId } from "@/services/sprint/getLastSprintId";
import { useQuery } from "@tanstack/react-query";

type LastSprintSuccessResponse = ResponseDetailSuccess<LastSprintResponse | null>;

export const useGetLastSprintId = () => {
  return useQuery<LastSprintSuccessResponse>({
    queryKey: ["sprint", "last", "id"],
    queryFn: getLastSprintId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};
