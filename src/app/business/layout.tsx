import Nav from "@/layouts/Nav";
import { UserProvider } from "@/context/User";
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
          <Nav path="business" />
          {children}
        </UserProvider>
      </div>
    </ReactQueryProvider>
  );
}
