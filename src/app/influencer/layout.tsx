import Nav from "@/layouts/Nav";
import { UserProvider } from "@/context/User";
import Footer from "@/components/footer";
import ReactQueryProvider from "@/QueryClientProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <div className=" min-h-screen bg-gray-200 ">
        <UserProvider>
          <Nav path="influencer" />
          {children}
          <Footer />
        </UserProvider>
      </div>
    </ReactQueryProvider>
  );
}
