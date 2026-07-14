export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBfru34xRNgWtlh0PGEe3VSLrbZ6ufKQZ_XbnmhblZNHhX3d2m-3xTllByJIN_z28lbuJcinUQGG1Rdw9PGyReEo6s2oXeyMLL8oKJQYDG5mKvjD0mVwegHtFuPo5df6LdRzz6RdGUd3KSM803oCvhdIOPfdnJdj-1n-8yurFFNfhg3D-ZpzldpiFbQeHscl3hbB84pwCryLRpsj-bUiDHQj9VavQ_1qQ8RtLYfGpwi_JMsHRGgeEQhr8HsWTeeKn_g_CM0bH8fx3k')` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className="relative z-10 max-w-[1200px] mx-auto px-margin-desktop w-full text-white">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-orange-200 mb-4">Maitre d'Art en Gironde</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-headline leading-tight">L'Alchimie de l'Héritage et de la Modernité</h1>
          <button className="bg-[#c7872d] hover:bg-[#ffb95f] px-10 py-4 rounded font-bold tracking-widest transition-all">
            DÉCOUVRIR
          </button>
        </div>
      </div>
    </section>
  );
}