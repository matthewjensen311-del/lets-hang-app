import Link from 'next/link';
import { Calendar, Users, Sparkles, MapPin, Clock, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#E5E3E0]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span
            className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] bg-clip-text text-transparent"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            Let&apos;s Hang
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-[#FF6B35]/20 transition-all active:scale-[0.97]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#7C5CFC]/10 text-[#7C5CFC] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-powered hangout planning
          </div>
          <h1
            className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-[#1A1A1A] leading-[1.1] tracking-tight"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            Stop planning.
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] bg-clip-text text-transparent">
              Start hanging out.
            </span>
          </h1>
          <p className="text-lg text-[#6B6B6B] mt-6 max-w-xl mx-auto leading-relaxed">
            Let&apos;s Hang syncs everyone&apos;s calendars, matches your interests, and uses AI to plan the perfect hangout — so you just show up.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/signup"
              className="w-full sm:w-auto text-center px-8 py-4 bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] text-white font-semibold rounded-2xl text-lg shadow-xl shadow-[#FF6B35]/20 hover:shadow-2xl hover:shadow-[#FF6B35]/30 transition-all active:scale-[0.97]"
            >
              Plan Your First Hangout
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto text-center px-8 py-4 border border-[#E5E3E0] text-[#1A1A1A] font-medium rounded-2xl hover:bg-[#F2F0ED] transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#E5E3E0] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF3F80]" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7C5CFC] to-[#00D4AA]" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFD23F] to-[#FF6B35]" />
              <span className="text-sm text-[#6B6B6B] ml-1">+ you</span>
            </div>
            <div className="bg-[#00D4AA]/10 text-[#00D4AA] px-3 py-2 rounded-xl text-sm font-medium">
              ✓ Everyone is free Saturday 2-6 PM
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-[#F2F0ED] rounded-xl">
                <span className="text-lg">☕</span>
                <div>
                  <p className="text-sm font-medium">Blue Bottle Coffee</p>
                  <p className="text-xs text-[#9B9B9B]">2:00 PM — Warm up with pour-overs</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F2F0ED] rounded-xl">
                <span className="text-lg">🎨</span>
                <div>
                  <p className="text-sm font-medium">MoMA</p>
                  <p className="text-xs text-[#9B9B9B]">3:30 PM — Check out the new exhibit</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F2F0ED] rounded-xl">
                <span className="text-lg">🍜</span>
                <div>
                  <p className="text-sm font-medium">Xi&apos;an Famous Foods</p>
                  <p className="text-xs text-[#9B9B9B]">5:30 PM — Hand-pulled noodles for everyone</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-[#6B6B6B]">~$35/person</span>
              <div className="px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FF3F80] text-white text-sm font-medium rounded-full">
                Let&apos;s do it! 🎉
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1A1A1A] mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Hanging out shouldn&apos;t be this hard
          </h2>
          <p className="text-center text-[#6B6B6B] mb-16 max-w-lg mx-auto">
            No more &quot;when are you free?&quot; texts. No more endless group chat debates. Just great hangouts.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                color: 'bg-[#7C5CFC]/10 text-[#7C5CFC]',
                title: 'Sync Calendars',
                description: 'Connect your calendar and we automatically find when everyone is free. No details shared — just availability.',
              },
              {
                icon: Users,
                color: 'bg-[#FF6B35]/10 text-[#FF6B35]',
                title: 'Match Vibes',
                description: 'We learn what you and your friends love — food, activities, budget, energy level — and find the perfect overlap.',
              },
              {
                icon: Sparkles,
                color: 'bg-[#00D4AA]/10 text-[#00D4AA]',
                title: 'AI Plans It All',
                description: 'Our AI creates a complete itinerary with real venues, times, and reservations. You just show up and hang.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>{step.title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1A1A1A] mb-16" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Everything you need to hang
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Clock, title: 'Smart Scheduling', desc: 'Finds overlapping free time across all your friends automatically' },
              { icon: Sparkles, title: 'AI Itineraries', desc: 'Complete plans with venues, times, and dietary accommodations' },
              { icon: MapPin, title: 'Real Venues', desc: 'Specific restaurant and activity recommendations in your area' },
              { icon: Users, title: 'Groups', desc: 'Create friend groups for recurring hangouts with your crew' },
              { icon: Calendar, title: 'Calendar Sync', desc: 'Google Calendar integration keeps availability always up to date' },
              { icon: ChevronRight, title: 'One-Tap RSVP', desc: 'Accept hangouts and see the full plan in seconds' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-[#E5E3E0]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35]/10 to-[#7C5CFC]/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-[#7C5CFC]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{feature.title}</h3>
                  <p className="text-sm text-[#6B6B6B] mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Your next hangout is one tap away
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Join thousands of friends who stopped texting &quot;when are you free?&quot; and started actually hanging out.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-[#1A1A1A] font-semibold rounded-2xl text-lg hover:shadow-xl transition-all active:scale-[0.97]"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#E5E3E0]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[#9B9B9B]">
            © 2026 Let&apos;s Hang. Made with ❤️ for better hangouts.
          </span>
          <div className="flex gap-6 text-sm text-[#9B9B9B]">
            <span className="hover:text-[#6B6B6B] cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-[#6B6B6B] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[#6B6B6B] cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
