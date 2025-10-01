import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getFoodPostByIdForCurrentUser } from "@/lib/food-posts";
import { PostDetail } from "@/components/posts/post-detail";

type PostPageProps = {
  params?: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[]>>;
};

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = params ? await params : null;

  if (!resolvedParams) {
    notFound();
  }

  const { id } = resolvedParams;
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const post = await getFoodPostByIdForCurrentUser(id);

  if (!post) {
    notFound();
  }

  return <PostDetail post={post} />;
}
