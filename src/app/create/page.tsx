/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { MultiSelect } from "~/components/ui/multi-select";
import { RichTextEditor } from "~/components/editor/rich-text-editor";
import { useAuth } from "~/hooks/use-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPaperPlane,
  faSpinner,
  faTag,
  faSignInAlt,
  faExclamationTriangle,
  faHeading,
  faAlignLeft,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { PostFormData, TiptapContent, TiptapNode } from "~/types/editor";

export default function CreatePostPage() {
  const router = useRouter();
  const { requireAuth, isSignedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState<PostFormData>({
    title: "",
    description: null,
    lore: "",
    tags: [],
    tweetLinks: [],
    images: [],
  });

  // Extract tweet links and images from editor content
  const extractFromContent = (content: TiptapContent | null) => {
    const tweetLinks: string[] = [];
    const images: string[] = [];
    let lore = "";

    if (content?.content) {
      const traverse = (node: TiptapNode) => {
        if (node.type === "tweetEmbed" && node.attrs?.url) {
          tweetLinks.push(node.attrs.url as string);
        }
        if (node.type === "image" && node.attrs?.src) {
          images.push(node.attrs.src as string);
        }
        if (node.type === "loreBlock" && node.content) {
          // Extract text content from lore block
          lore = extractTextFromNode(node);
        }
        if (node.content) {
          node.content.forEach(traverse);
        }
      };
      content.content.forEach(traverse);
    }

    return { tweetLinks, images, lore };
  };

  const extractTextFromNode = (node: TiptapNode): string => {
    if (node.type === "text") {
      return node.text ?? "";
    }
    if (node.content) {
      return node.content.map(extractTextFromNode).join("");
    }
    return "";
  };

  const handleEditorChange = (content: TiptapContent | null) => {
    const extracted = extractFromContent(content);
    setPostData((prev) => ({
      ...prev,
      description: content,
      ...extracted,
    }));
  };

  const handleImageUpload = (url: string) => {
    setPostData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      requireAuth();
      return;
    }

    if (!postData.title.trim() || !postData.description) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const post = await response.json();
      router.push(`/e-lafda/${post.slug}`);
    } catch (error) {
      console.error("Error creating post:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="mx-auto max-w-2xl">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6 text-center">
                  <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-muted-foreground h-8 w-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Authentication Required
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      You need to be signed in to create a post and share your
                      story with the community.
                    </p>
                  </div>
                  <Button
                    onClick={() => requireAuth()}
                    size="lg"
                    className="w-full"
                  >
                    <FontAwesomeIcon
                      icon={faSignInAlt}
                      className="mr-2 h-4 w-4"
                    />
                    Sign In to Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-muted-foreground hover:text-foreground -ml-2"
                  >
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className="mr-2 h-4 w-4"
                    />
                    Back
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go back to the previous page</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Card className="border shadow-sm">
              <CardContent className="space-y-6 pt-6">
                <form className="space-y-6">
                  {/* Title Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FontAwesomeIcon
                            icon={faHeading}
                            className="text-muted-foreground h-4 w-4 cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Give your post a compelling title that captures
                            attention
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Label
                        htmlFor="title"
                        className="text-base font-semibold"
                      >
                        Title
                      </Label>
                      <span className="text-destructive text-xs font-medium">
                        *
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-muted-foreground h-3 w-3 cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            A good title is clear, engaging, and gives readers
                            an idea of what to expect
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="title"
                      placeholder="What happened? Give it a catchy title"
                      value={postData.title}
                      onChange={(e) =>
                        setPostData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                      className="bg-background h-12 text-base"
                    />
                    <p className="text-muted-foreground text-xs">
                      Create a compelling title that captures the essence of
                      your story.
                    </p>
                  </div>

                  <Separator />

                  {/* Tags Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FontAwesomeIcon
                            icon={faTag}
                            className="text-muted-foreground h-4 w-4 cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Tags help categorize your post and make it
                            discoverable
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Label className="text-base font-semibold">Tags</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-muted-foreground h-3 w-3 cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Use relevant keywords like &quot;politics&quot;,
                            &quot;sports&quot;, &quot;technology&quot;, etc.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <MultiSelect
                      values={postData.tags}
                      onChange={(tags) =>
                        setPostData((prev) => ({ ...prev, tags }))
                      }
                      placeholder="Add tags to help people discover your post"
                    />
                    <p className="text-muted-foreground text-xs">
                      Add relevant tags to help others find your post. Add comma
                      (,) to separate tags.
                    </p>
                  </div>

                  <Separator />

                  {/* Content Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FontAwesomeIcon
                            icon={faAlignLeft}
                            className="text-muted-foreground h-4 w-4 cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Write your story using the rich text editor with
                            formatting options
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Label className="text-base font-semibold">Content</Label>
                      <span className="text-destructive text-xs font-medium">
                        *
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-muted-foreground h-3 w-3 cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">
                              Rich text editor features:
                            </p>
                            <ul className="space-y-0.5 text-xs">
                              <li>
                                • <strong>Bold/Italic:</strong> Format text
                                emphasis
                              </li>
                              <li>
                                • <strong>H1/H2/H3:</strong> Create headings for
                                structure
                              </li>
                              <li>
                                • <strong>Lists:</strong> Bullet points and
                                numbered lists
                              </li>
                              <li>
                                • <strong>Quotes:</strong> Highlight important
                                text
                              </li>
                              <li>
                                • <strong>Lore Block:</strong> Add background
                                information
                              </li>
                              <li>
                                • <strong>Tweet Embed:</strong> Include tweets
                                in your post
                              </li>
                              <li>
                                • <strong>Images:</strong> Upload and embed
                                images
                              </li>
                              <li>
                                • <strong>Auto-Embed:</strong> Paste Twitter/X
                                URLs to auto-convert to embeds
                              </li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <RichTextEditor
                      content={postData.description}
                      onChange={handleEditorChange}
                      onImageUpload={handleImageUpload}
                      placeholder="Tell your story... Use the toolbar to add formatting, lore blocks, tweet embeds, and images. Paste Twitter/X URLs to auto-convert them to embeds!"
                    />
                    <p className="text-muted-foreground text-xs">
                      Use the rich text editor to format your content, add
                      images, and embed tweets. Paste Twitter/X URLs to
                      automatically convert them to embeds.
                    </p>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.back()}
                          disabled={isSubmitting}
                          size="lg"
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Discard changes and go back</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={
                            !postData.title.trim() ||
                            !postData.description ||
                            isSubmitting
                          }
                          size="lg"
                          className="w-full sm:w-auto"
                        >
                          {isSubmitting ? (
                            <>
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="mr-2 h-4 w-4 animate-spin"
                              />
                              Creating Post...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faPaperPlane}
                                className="mr-2 h-4 w-4"
                              />
                              Create Post
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {!postData.title.trim() || !postData.description
                            ? "Please fill in the title and content to create your post"
                            : "Publish your post to the community"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}