"use client";

import { useContracts } from "@/hooks/useContracts";
import { useUser } from "@/context/User";
import { useState } from "react";
import { Clipboard, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Spinner = () => (
  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
);

export default function ContractsPage() {
  const { user } = useUser();
  const { contracts, updateContractStatus, isLoading } = useContracts();
  const [activeTab, setActiveTab] = useState<
    "all" | "draft" | "active" | "completed" | "terminated"
  >("active");

  const [loadingStates, setLoadingStates] = useState<
    Record<
      string,
      { activate?: boolean; terminate?: boolean; complete?: boolean }
    >
  >({});

  const filteredContracts =
    activeTab === "all"
      ? contracts
      : contracts.filter((contract) => contract.status === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} className="text-green-500" />;
      case "completed":
        return <FileText size={16} className="text-blue-500" />;
      case "terminated":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const handleStatusUpdate = async (
    contractId: string,
    actionType:
      | "active"
      | "terminated"
      | "influencerConfirmed"
      | "ownerConfirmed",
  ) => {
    // Map action types to loading state keys
    const loadingKey = {
      active: "activate",
      terminated: "terminate",
      influencerConfirmed: "complete",
      ownerConfirmed: "complete",
    }[actionType];

    setLoadingStates((prev) => ({
      ...prev,
      [contractId]: { ...prev[contractId], [loadingKey]: true },
    }));

    try {
      await updateContractStatus(
        contractId,
        actionType,
        user?.role === "business" ? "business" : "influencer",
      );
    } catch (error) {
      console.error("Failed to update contract status:", error);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [contractId]: { ...prev[contractId], [loadingKey]: false },
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container max-w-5xl min-h-[calc(100vh-10rem)] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Clipboard size={24} />
        Contract Management
      </h1>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2 mb-6">
        {(["all", "active", "draft", "completed", "terminated"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md font-medium capitalize transition-all duration-150 cursor-pointer ${
                activeTab === tab
                  ? "bg-primary text-white shadow"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border rounded-xl p-5 bg-white shadow-sm">
              <div className="flex justify-between flex-wrap gap-4 items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-10/12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">
            {activeTab === "all"
              ? "No contracts found"
              : `No ${activeTab} contracts found`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredContracts.map((contract) => {
            const contractLoading = loadingStates[contract._id] || {};

            return (
              <div
                key={contract._id}
                className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between flex-wrap gap-4 items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Contract #{contract._id.slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Deadline: {formatDate(contract.deadline)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {getStatusIcon(contract.status)}
                    <span className="capitalize">{contract.status}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-gray-700">
                      Deliverables
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {contract.socialMediaActions.map((action, index) => (
                        <li key={index}>
                          {action.quantity}x {action.platform}{" "}
                          {action.actionType}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-gray-700">
                      Financials
                    </h4>
                    <p className="text-lg font-bold text-gray-900">
                      ${contract.price}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {formatDate(contract.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {contract.status === "draft" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(contract._id, "active")
                        }
                        disabled={
                          contractLoading.activate || contractLoading.terminate
                        }
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded flex items-center gap-1 disabled:opacity-70"
                      >
                        {contractLoading.activate ? (
                          <>
                            <Spinner />
                            Processing...
                          </>
                        ) : (
                          "Activate"
                        )}
                      </button>

                      <button
                        onClick={() =>
                          handleStatusUpdate(contract._id, "terminated")
                        }
                        disabled={
                          contractLoading.terminate || contractLoading.activate
                        }
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded flex items-center gap-1 disabled:opacity-70"
                      >
                        {contractLoading.terminate ? (
                          <>
                            <Spinner />
                            Terminating...
                          </>
                        ) : (
                          "Terminate"
                        )}
                      </button>
                    </>
                  )}

                  {contract.status === "active" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(contract._id, "influencerConfirmed")
                      }
                      disabled={
                        contractLoading.complete || contract.influencerConfirmed
                      }
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded flex items-center gap-1 disabled:opacity-70"
                    >
                      {contractLoading.complete ? (
                        <>
                          <Spinner />
                          Processing...
                        </>
                      ) : contract.influencerConfirmed ? (
                        "waiting for approval"
                      ) : (
                        "Mark Completed"
                      )}
                    </button>
                  )}

                  {contract.status === "completed" && (
                    <span className="text-sm text-green-600 flex items-center">
                      <CheckCircle size={16} className="mr-1" />
                      Contract fulfilled
                    </span>
                  )}

                  {contract.status === "terminated" && (
                    <span className="text-sm text-red-600 flex items-center">
                      <XCircle size={16} className="mr-1" />
                      Contract terminated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
