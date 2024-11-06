import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur-md">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-semibold">TutorAI</Link>
          <div className="space-x-4">
            <Link href="#features" className="text-sm hover:text-gray-300">Features</Link>
            <Link href="#pricing" className="text-sm hover:text-gray-300">Pricing</Link>
            <Link href="/login" className="text-sm hover:text-gray-300">Log in</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="pt-32 pb-20 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to TutorAI</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Revolutionize your learning experience with cutting-edge technology and personalized education.</p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 text-lg">
            Get Started
          </Button>
        </section>

        <section id="features" className="py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                title="Smart Learning" 
                description="AI-powered personalized learning paths tailored to your needs."
              />
              <FeatureCard 
                title="Collaborative Spaces" 
                description="Connect with peers and experts in real-time virtual classrooms."
              />
              <FeatureCard 
                title="Progress Tracking" 
                description="Visualize your growth with detailed analytics and insights."
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard 
                title="Basic" 
                price="$9.99" 
                features={["Access to all courses", "Basic progress tracking", "Community support"]}
              />
              <PricingCard 
                title="Pro" 
                price="$19.99" 
                features={["Everything in Basic", "Advanced analytics", "1-on-1 tutoring sessions"]}
                highlighted={true}
              />
              <PricingCard 
                title="Enterprise" 
                price="Custom" 
                features={["Everything in Pro", "Customized learning paths", "Dedicated support team"]}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} StudentApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg text-center">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function PricingCard({ title, price, features, highlighted = false }: { 
  title: string; 
  price: string; 
  features: string[]; 
  highlighted?: boolean 
}) {
  return (
    <div className={`p-6 rounded-lg text-center ${highlighted ? 'bg-blue-600' : 'bg-gray-800'}`}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-3xl font-bold mb-6">{price}<span className="text-sm">/month</span></p>
      <ul className="text-left mb-6">
        {features.map((feature, index) => (
          <li key={index} className="mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20">
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Button className={`w-full ${highlighted ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'} hover:opacity-90`}>
        Choose Plan
      </Button>
    </div>
  )
}