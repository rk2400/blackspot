import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0">
          <img 
            src="https://images.newscientist.com/wp-content/uploads/2019/09/16145926/new-scientist-full.jpg?width=1674" 
            alt="Candle making studio" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="block text-white/80 text-sm font-bold tracking-[0.2em] uppercase mb-4">Our Essence</span>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">The BlackSpot Project</h1>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-serif text-stone-900 mb-6">Our Story</h2>
            <div className="prose prose-stone text-lg text-stone-600 leading-relaxed space-y-6">
              <p>
                The BlackSpot Project began with a simple yet profound realization: mindful rituals can transform our inner and outer worlds.
                What started as a personal passion for blending essential oils in a small kitchen has grown into a curated collection of 
                artisanal candles, each designed to evoke specific memories and emotions.
              </p>
              <p>
                We believe in the beauty of slow living. In a world that often moves too fast, lighting a candle is a ritual—a moment 
                to pause, breathe, and reconnect with yourself and your surroundings.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2 relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://cdn.mos.cms.futurecdn.net/QJ8shmsq86kGLzAn9oGFrE-1200-80.jpg.webp" 
              alt="Hand pouring candles" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-indigo-950 rounded-3xl p-12 md:p-20 shadow-sm border border-stone-800 mb-24 text-white">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-serif mb-4">Our North Star</h2>
            <p className="text-stone-300">
              We are building for the elevation of human consciousness. From doing to being. From effort to presence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Being over Doing" description="Prioritizing stillness, coherence, and presence in everyday life." />
            <StatCard title="Compassion & Care" description="Practices that soften the self and expand empathy." />
            <StatCard title="Integration" description="Turning insight into embodied action across work and home." />
          </div>
        </div>

        <div className="rounded-3xl p-12 md:p-16 bg-gradient-to-br from-indigo-50 via-stone-50 to-rose-50 border border-stone-200 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-serif text-stone-900 mb-4">Principles of Being</h2>
            <p className="text-stone-600">Simple, repeatable anchors that cultivate a steady state of awareness.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueEmojiCard emoji="🕊️" title="Presence" description="Return attention to now—breath, body, and environment." />
            <ValueEmojiCard emoji="🌬️" title="Breath" description="Gentle cycles to balance the nervous system and mind." />
            <ValueEmojiCard emoji="🌙" title="Stillness" description="Quiet moments that allow clarity and subtlety to emerge." />
            <ValueEmojiCard emoji="✨" title="Intention" description="Conscious direction and gentle repetition shape outcomes." />
            <ValueEmojiCard emoji="💖" title="Compassion" description="Softening toward self and others transforms relationships." />
            <ValueEmojiCard emoji="🔗" title="Integration" description="Bridging insight with practical choices in daily life." />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-12 md:p-16 shadow-sm border border-stone-100 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-serif text-stone-900 mb-4">Practices We Build</h2>
            <p className="text-stone-600">Tools designed for gentle, daily repetition and deepening awareness.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PracticeCard title="Affirmation Flow" description="Focused line-by-line reading to rewire inner dialogue." href="/afirmations" emoji="✨" />
            <PracticeCard title="Journal" description="Free writing with steady prompts to integrate insight." href="/journal" emoji="📝" />
            <PracticeCard title="Manifest Dialogues" description="Short video messages to future self for continuity." href="/manifest" emoji="🎥" />
            <PracticeCard title="Breath Cycles" description="Calm animation guiding inhale, hold, and exhale." href="/" emoji="🌬️" />
            <PracticeCard title="Cosmic Rhythm" description="Moon phase guidance to align energy and planning." href="/" emoji="🌙" />
            <PracticeCard title="Community Circle" description="Shared reflections and support as we grow together." href="/contact" emoji="🕊️" />
          </div>
        </div>

        <div className="rounded-3xl p-12 md:p-16 bg-gradient-to-br from-indigo-900 via-stone-900 to-violet-900 text-white mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-serif mb-4">Journey Map</h2>
            <p className="text-stone-300">A simple arc—from awakening to integration—repeated many times.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StepCard title="Awaken" description="Notice and name." />
            <StepCard title="Stabilize" description="Breath, stillness." />
            <StepCard title="Express" description="Write, speak." />
            <StepCard title="Integrate" description="Act, align." />
            <StepCard title="Serve" description="Compassion outward." />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-serif text-stone-900 mb-3">Join the Movement</h3>
          <p className="text-stone-600 mb-6">If this resonates, begin a tiny daily practice. One minute, today.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/afirmations" className="px-5 py-3 rounded-xl bg-stone-900 text-white hover:bg-stone-800">Start Affirmations</Link>
            <Link href="/manifest" className="px-5 py-3 rounded-xl bg-stone-200 text-stone-900 hover:bg-stone-300">Record a Manifest</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <h3 className="text-xl font-serif text-stone-900 mb-3">{title}</h3>
      <p className="text-stone-500 leading-relaxed">{description}</p>
    </div>
  );
}

function ValueEmojiCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-stone-200 bg-white p-8 hover:shadow-md transition-shadow">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 via-stone-100 to-rose-100 flex items-center justify-center text-3xl mb-6">
        {emoji}
      </div>
      <h3 className="text-xl font-serif text-stone-900 mb-3">{title}</h3>
      <p className="text-stone-600 leading-relaxed text-center">{description}</p>
    </div>
  );
}

function StatCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-stone-700 p-6 bg-white/5">
      <div className="text-white font-serif text-xl mb-2">{title}</div>
      <div className="text-stone-300">{description}</div>
    </div>
  );
}

function PracticeCard({ title, description, href, emoji }: { title: string; description: string; href: string; emoji: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-stone-200 p-6 bg-white hover:bg-stone-50 transition">
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-stone-900 font-serif text-xl mb-2">{title}</div>
      <div className="text-stone-600">{description}</div>
    </Link>
  );
}

function StepCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-stone-700 p-6 bg-white/5 text-white text-center">
      <div className="text-lg font-serif">{title}</div>
      <div className="text-stone-300 mt-2">{description}</div>
    </div>
  );
}

