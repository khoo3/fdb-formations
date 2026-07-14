export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant h-20">
      <div className="flex justify-between items-center px-margin-desktop h-full max-w-[1200px] mx-auto">
        <div className="text-2xl font-bold text-primary tracking-tight font-headline">
          LES FORGES DE BAZAS
        </div>
        <nav className="hidden md:flex gap-8 items-center uppercase text-sm tracking-widest font-body">
          <a href="#services" className="hover:text-on-tertiary-container transition-colors">Services</a>
          <a href="#courses" className="hover:text-on-tertiary-container transition-colors">Courses</a>
          <a href="#contact" className="hover:text-on-tertiary-container transition-colors">Contact</a>
          <button className="bg-primary text-white px-6 py-2 rounded text-xs hover:bg-gray-800">
            Request Quote
          </button>
        </nav>
      </div>
    </header>
  );
}