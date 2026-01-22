import { UserProvider } from "@/context/User";
import ReactQueryProvider from "@/QueryClientProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <div className=" min-h-screen bg-gray-200 ">
        <UserProvider>{children}</UserProvider>
      </div>
    </ReactQueryProvider>
  );
}
