import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PublicLayout({ children, fullBleed = false }) {
  return (
    <div
      className={`min-h-screen flex flex-col text-white ${
        fullBleed
          ? "bg-slate-950"
          : "bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(15,118,255,0.15),_transparent_55%)]"
      }`}
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

