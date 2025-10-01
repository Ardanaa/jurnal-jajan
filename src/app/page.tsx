import { currentUser } from "@clerk/nextjs/server";
import { LandingScreen } from "@/components/landing-screen";
import { DashboardClient } from "@/components/dashboard-client";
import { getFoodPostsForCurrentUser } from "@/lib/food-posts";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return <LandingScreen />;
  }

  const posts = await getFoodPostsForCurrentUser();

  return (
    <DashboardClient
      user={{
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        imageUrl: user.imageUrl ?? null,
      }}
      posts={posts}
    />
  );
}
