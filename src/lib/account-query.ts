import { queryOptions } from "@tanstack/react-query";
import { getAccount } from "./account.functions";
export const accountQuery = () => queryOptions({ queryKey: ["account"], queryFn: () => getAccount(), staleTime: 30_000 });