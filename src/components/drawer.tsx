"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/context/Message";
// import { useUser } from "@/context/User";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { /*Send*/ Mail, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ContractDialog } from "@/components/contract-dialog"; // Import the ContractDialog
import { useUser } from "@/context/User";

interface SocialMediaPlatform {
  username: string;
  followers: string | number;
}

// interface SocialMediaAction {
//   platform: "instagram" | "tiktok" | "telegram";
//   actionType: "post" | "story";
//   quantity: number;
// }

interface SocialMedia {
  instagram?: SocialMediaPlatform;
  tiktok?: SocialMediaPlatform;
  telegram?: SocialMediaPlatform;
  [key: string]: SocialMediaPlatform | undefined;
}

interface Conversation {
  _id: string;
  lastMessage: string;
  updatedAt: string;
  otherUser: {
    name: string;
    image: string;
  };
}

interface Influencer {
  _id: string;
  name: string;
  image: string;
  bio: string;
  location: string;
  price: number;
  socialMedia: SocialMedia;
  verified: boolean;
}

export function InfluencerDetailPopup({
  influencer,
  open,
  onClose,
}: {
  influencer: Influencer;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useUser();
  const router = useRouter();
  // const { user } = useUser();
  const { startNewConversation, sendMessage } = useMessages();
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);

  // const socialMedia: SocialMedia =
  //   typeof influencer. === "string"
  //     ? JSON.parse(influencer.socialMedia)
  //     : influencer.socialMedia;

  const handleSendInitialMessage = async () => {
    if (!messageInput.trim()) return;

    setIsSending(true);
    try {
      // 1. Create new conversation
      const newConversation: Conversation = await startNewConversation(
        influencer._id
      );

      // 2. Send initial message
      await sendMessage(messageInput, newConversation._id);

      // 3. Redirect to messages page
      router.push("/business/message");
      onClose();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // const handleCreateContract = async (contractData: {
  //   senderId: string;
  //   reciverId: string;
  //   price: number;
  //   socialMediaActions: SocialMediaAction[];
  //   deadline: string;
  // }) => {
  //   console.log("Creating contract with:", contractData);
  //   // Here you would call your API to create the contract
  //   // After successful creation, you might want to:
  //   // 1. Close the contract dialog
  //   // 2. Show a success message
  //   // 3. Optionally close the influencer detail popup
  //   setShowContractDialog(false);
  // };

  const handleSendContract = () => {
    setShowContractDialog(true);
  };

  return (
    <>
      <Drawer open={open} onClose={onClose}>
        <DrawerContent className="max-w-2xl mx-auto rounded-lg shadow-xl">
          <div className="overflow-y-auto max-h-[90vh]">
            <DrawerHeader className="px-4 sm:px-6">
              <DrawerTitle className="text-lg sm:text-xl">
                {influencer.name}&apos;s Profile
              </DrawerTitle>
            </DrawerHeader>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Profile Section */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mb-4">
                  <AvatarImage src={influencer.image} alt={influencer.name} />
                  <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{influencer.name}</h3>
                  <p className="text-muted-foreground">
                    {influencer.bio?.trim() || "No bio available"}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {influencer.location || "Not specified"}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{influencer.price} Birr</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {influencer.verified ? (
                      <span className="text-green-500">Verified</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Not Verified
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Social Media
              <div>
                <h4 className="font-semibold mb-3">Social Media</h4>
                <div className="space-y-2">
                  {Object.entries(socialMedia).map(([platform, data]) => {
                    if (!data) return null;
                    return (
                      <div
                        key={platform}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="capitalize font-medium">
                          {platform}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {data.followers} followers
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div> */}

              {/* Message Input (conditionally shown) */}
              {showMessageInput && (
                <div className="space-y-2">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Write your message to ${influencer.name}...`}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowMessageInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendInitialMessage}
                      disabled={isSending || !messageInput.trim()}
                    >
                      {isSending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Action Buttons (shown when message input is hidden) */}
            {!showMessageInput && (
              <div className="sticky bottom-0 bg-background border-t p-4">
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowMessageInput(true)}
                    className="flex-1 gap-2"
                  >
                    <Mail size={16} />
                    Send Message
                  </Button>
                  <Button
                    onClick={handleSendContract}
                    variant="secondary"
                    className="flex-1 gap-2"
                  >
                    <FileText size={16} />
                    Send Contract
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      {showContractDialog && (
        <ContractDialog
          senderId={user?.id || ""} // Replace with actual sender ID
          reciverId={influencer._id}
          opened={showContractDialog}
          onClose={() => setShowContractDialog(false)}
        />
      )}
    </>
  );
}
