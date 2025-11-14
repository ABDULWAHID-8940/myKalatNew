"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, use } from "react";
import { ContractDialog } from "@/components/contract-dialog";
import { useProposals } from "@/context/Proposal";
import { useMessages } from "@/context/Message";
import { useUser } from "@/context/User";
import { useRouter } from "next/navigation";
import { InfluencerDetailPopup } from "@/components/drawer";
import { useInfluencers } from "@/context/Influencer";
import Image from "next/image";
import { useAllProposals } from "@/hooks/useProposals";
import {
  Clipboard,
  CheckCircle,
  MessageCircle,
  XCircle,
  Clock3,
  DollarSign,
  MapPin,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ProposalStatus = "pending" | "accepted" | "rejected";

export default function ProposalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();
  const { influencers } = useInfluencers();

  const { updateProposalStatus } = useProposals();
  const { data: allProposals, isLoading } = useAllProposals(id);

  const { startNewConversation, sendMessage } = useMessages();

  const { user } = useUser();

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusIcon = (status: ProposalStatus) => {
    switch (status) {
      case "pending":
        return <Clock3 size={16} className="sm:mr-1" />;
      case "accepted":
        return <CheckCircle size={16} className="sm:mr-1" />;
      case "rejected":
        return <XCircle size={16} className="sm:mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancel = (id: string) => {
    updateProposalStatus(id, "rejected");
  };

  const handleMessage = () => {
    setShowMessageInput(true);
  };

  const handleSendContract = () => {
    setShowContractDialog(true);
  };

  const handleSendInitialMessage = async (id: string) => {
    if (!messageInput.trim()) return;

    setIsSending(true);
    try {
      // 1. Create new conversation
      const newConversation = await startNewConversation(id);

      // 2. Send initial message
      await sendMessage(messageInput, newConversation._id);

      // 3. Redirect to messages page
      router.push("/business/message");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
            <p className="text-gray-600 mt-1">Manage your received proposals</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-b-2xl shadow-sm min-h-[500px]">
          <div className="p-3 sm:p-6">
            {allProposals?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText size={48} className="mb-4 opacity-50" />
                <p className="text-lg">No proposals yet</p>
                <p className="text-sm">Your proposals will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allProposals
                  ?.filter((proposal) => proposal.status !== "rejected") // Filter out rejected proposals
                  .map((proposal) => (
                    <div
                      key={proposal._id}
                      className="px-2 sm:px-6 rounded-lg border border-gray-400 hover:shadow-sm transition-all"
                    >
                      {/* <InfluencerDetailPopup
                        influencer={
                          influencers.filter(
                            (i) => i._id === proposal.influencerId._id
                          )[0]
                        } // Replace with actual influencer ID
                        open={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                      /> */}
                      <div className="flex flex-col">
                        <Accordion type="single" collapsible>
                          <AccordionItem value="item-1">
                            <AccordionTrigger>
                              {/* Header with title and status */}
                              <div className="flex flex-col w-full">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="sm:text-lg font-semibold text-[18px] text-gray-900 flex items-center">
                                      <Clipboard
                                        size={18}
                                        className="mr-2 text-gray-400"
                                      />
                                      {proposal.jobId.title}
                                    </h3>
                                  </div>
                                  <span
                                    className={` ml-2 inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                                      proposal.status
                                    )}`}
                                  >
                                    {getStatusIcon(proposal.status)}
                                    <span className="hidden sm:inline-flex">
                                      {proposal.status.charAt(0).toUpperCase() +
                                        proposal.status.slice(1)}
                                    </span>
                                  </span>
                                </div>

                                {/* Key details in compact grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-4 gap-2 mb-4">
                                  <div className="flex items-center text-sm">
                                    <DollarSign
                                      size={16}
                                      className="mr-2 text-gray-400 flex-shrink-0"
                                    />
                                    <div>
                                      <span className="text-gray-500">
                                        Budget
                                      </span>
                                      <p className="font-medium">
                                        ${proposal.jobId.price}
                                      </p>
                                    </div>
                                  </div>

                                  {proposal.jobId.location && (
                                    <div className="flex items-center text-sm">
                                      <MapPin
                                        size={16}
                                        className="mr-2 text-gray-400 flex-shrink-0"
                                      />
                                      <div>
                                        <span className="text-gray-500">
                                          Location
                                        </span>
                                        <p className="font-medium">
                                          {proposal.jobId.location}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center text-sm">
                                    <Calendar
                                      size={16}
                                      className="mr-2 text-gray-400 flex-shrink-0"
                                    />
                                    <div>
                                      <span className="text-gray-500">
                                        Submitted
                                      </span>
                                      <p className="font-medium">
                                        {formatDate(proposal.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-6">
                                {/* Influencer Info */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                                    <User
                                      size={16}
                                      className="mr-2 text-gray-400"
                                    />
                                    Influencer
                                  </h4>
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                      {proposal.influencerId.image ? (
                                        <Image
                                          src={proposal.influencerId.image}
                                          alt={proposal.influencerId.name}
                                          width={48}
                                          height={48}
                                          className="object-cover w-full h-full"
                                        />
                                      ) : (
                                        <User
                                          size={20}
                                          className="text-gray-500"
                                        />
                                      )}
                                    </div>
                                    <div className=" flex items-center gap-5">
                                      <h3 className="font-medium text-gray-900">
                                        {proposal.influencerId.name}
                                      </h3>
                                      <Button
                                        variant="outline"
                                        className="mt-1 w-fit text-sm"
                                        onClick={() => setIsPopupOpen(true)}
                                      >
                                        View Profile
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Proposal Message */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                                    <MessageCircle
                                      size={16}
                                      className="mr-2 text-gray-400"
                                    />
                                    Proposal message
                                  </h4>
                                  <p className="text-sm text-gray-600 pl-6">
                                    {proposal.message}
                                  </p>
                                </div>

                                {/* Optional Message Input */}
                                {showMessageInput && (
                                  <div className="space-y-3">
                                    <Textarea
                                      value={messageInput}
                                      onChange={(e) =>
                                        setMessageInput(e.target.value)
                                      }
                                      placeholder={`Write your message to ${proposal.influencerId.name}...`}
                                      className="min-h-[100px]"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          setShowMessageInput(false)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleSendInitialMessage(
                                            proposal.influencerId._id
                                          )
                                        }
                                        disabled={
                                          isSending || !messageInput.trim()
                                        }
                                      >
                                        {isSending
                                          ? "Sending..."
                                          : "Send Message"}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 mt-4 pt-4">
                                  <Button
                                    variant="outline"
                                    className="text-sm border-red-500
                                    "
                                    onClick={() => handleCancel(proposal._id)}
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="text-sm text-blue-600 border-blue-600 hover:bg-blue-50"
                                    onClick={handleMessage}
                                  >
                                    Message
                                  </Button>
                                  <Button
                                    className="text-sm bg-green-600 text-white hover:bg-green-700"
                                    onClick={handleSendContract}
                                  >
                                    Send Contract
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                      {showContractDialog && (
                        <ContractDialog
                          senderId={user?.id || ""} // Replace with actual sender ID
                          reciverId={proposal.influencerId._id}
                          opened={showContractDialog}
                          onClose={() => setShowContractDialog(false)}
                        />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
