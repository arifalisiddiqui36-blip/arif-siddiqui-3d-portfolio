import IntroProvider from "@/components/providers/IntroProvider";
import Loader from "@/components/ui/Loader";
import Nav from "@/components/ui/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Infrastructure from "@/components/sections/Infrastructure";
import Journey from "@/components/sections/Journey";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <IntroProvider>
      <Loader />
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Infrastructure />
        <Journey />
        <Contact />
      </main>
    </IntroProvider>
  );
}
