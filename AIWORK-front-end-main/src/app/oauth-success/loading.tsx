import { Loading } from "@/components/Loading";

export default function OAuthSuccessLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loading />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
