import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PublicLayout({ children, fullBleed = false }) {
  return (
    <div
      className={`min-h-screen flex flex-col ${
        fullBleed ? "bg-white" : "bg-[#F3F6FC]"
      } text-slate-900`}
    >
      <Header isTransparent={fullBleed} />
      <main
        className={`flex-1 ${
          fullBleed ? "" : "px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full"
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

