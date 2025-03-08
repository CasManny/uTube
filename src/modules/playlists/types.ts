import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type PlaylistGetManyType = inferRouterOutputs<AppRouter>['playlists']['getMany']