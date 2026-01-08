import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Layers,
  Brain,
  Sparkles,
  Eye,
  Shield,
  Zap,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';
import monocleLogo from '@/assets/monocle-logo.png';

const features = [
  {
    icon: Layers,
    title: 'Unified Work View',
    description: 'See emails, messages, documents, and tasks in one calm interface.',
  },
  {
    icon: Brain,
    title: 'Automatic Detection',
    description: 'AI detects tasks and groups related work into threads automatically.',
  },
  {
    icon: Sparkles,
    title: 'Smart Priorities',
    description: 'Know what matters with explainable "Why this, why now?" recommendations.',
  },
  {
    icon: Eye,
    title: 'Cognitive Awareness',
    description: 'Visual indicators help you understand your mental load in real-time.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays yours. We store only summaries, never raw content.',
  },
  {
    icon: Zap,
    title: 'Non-Disruptive',
    description: 'No popups or constant notifications. Suggestions appear at natural pauses.',
  },
];

const benefits = [
  'Understand your work, not just tasks',
  'AI-powered priority recommendations',
  'Zero manual effort required',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">Premium Work Intelligence</span>
              </div>

              <h1 className="text-display-lg text-foreground mb-6 leading-tight">
                Master Your<br />
                <span className="text-primary">Clarity.</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Monocle understands your work, not just your tasks. Get clarity on priorities,
                stay focused, and avoid burnout — without the manual effort.
              </p>

              <ul className="space-y-3 mb-10">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/login">
                    Get started free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 w-5 h-5" />
                    View demo
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Right - Logo Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Decorative rings */}
                <div className="absolute inset-0 -m-8 rounded-full border border-primary/10 animate-pulse" />
                <div className="absolute inset-0 -m-16 rounded-full border border-primary/5" />
                <div className="absolute inset-0 -m-24 rounded-full border border-primary/[0.02]" />

                <div className="relative bg-card rounded-3xl p-12 shadow-elevated border">
                  <img
                    src={monocleLogo}
                    alt="Monocle - Focus on what matters"
                    className="w-64 h-auto lg:w-80"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-2xl border bg-card shadow-elevated overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none z-10" />
            <div className="p-8 space-y-6">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Good afternoon, Alex</h3>
                  <p className="text-sm text-muted-foreground">You have 3 priority items today</p>
                </div>
                <Badge variant="info" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Ready
                </Badge>
              </div>

              {/* Mock work threads */}
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: 'Q4 Budget Planning', priority: 'high', progress: 35 },
                  { title: 'Product Roadmap 2024', priority: 'high', progress: 60 },
                  { title: 'API Integration', priority: 'medium', progress: 45 },
                ].map((thread, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-background/50 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={thread.priority === 'high' ? 'high' : 'medium'}>
                        {thread.priority}
                      </Badge>
                      <span className="text-sm font-medium">{thread.title}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${thread.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-display-sm text-foreground mb-4">
              Work smarter, not harder
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Monocle observes your work patterns and helps you make better decisions
              about where to focus your energy.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-xl border bg-card hover:shadow-soft transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-title mb-2">{feature.title}</h3>
                <p className="text-body-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-display-sm text-foreground mb-4">
              Ready to focus on what matters?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join professionals who've reclaimed their clarity and productivity with Monocle.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/login">
                Start for free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <img src={monocleLogo} alt="Monocle" className="h-6 w-auto" />
            <span>© 2024</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
