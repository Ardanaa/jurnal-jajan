import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getFoodPostByIdForCurrentUser } from "@/lib/food-posts";
import { PostDetail } from "@/components/posts/post-detail";

interface PostPageProps {
  params: { id: string };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = params;
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
