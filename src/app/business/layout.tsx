import Nav from "@/layouts/Nav";
import { UserProvider } from "@/context/User";
import { JobProvider } from "@/context/Job";
import { InfluencerProvider } from "@/context/Influencer";
import { ProposalProvider } from "@/context/Proposal";
import { MessageProvider } from "@/context/Message";
import { ContractProvider } from "@/context/Contract";
import ReactQueryProvider from "@/QueryClientProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <div className=" min-h-screen bg-gray-50 ">
        <UserProvider>
          <InfluencerProvider>
            <JobProvider>
              <ProposalProvider>
                <MessageProvider>
                  <ContractProvider>
                    <Nav path="business" />
                    {children}
                  </ContractProvider>
                </MessageProvider>
              </ProposalProvider>
            </JobProvider>
          </InfluencerProvider>
        </UserProvider>
      </div>
    </ReactQueryProvider>
  );
}
