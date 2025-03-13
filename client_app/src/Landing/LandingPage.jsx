import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  CheckCircle2,
  Star,
  Users,
  FileCheck,
  BarChart3,
  MessageSquare,
  Moon,
  Sun
} from 'lucide-react';

function LandingPage() {
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <img className="h-8 w-auto" src="/logo.png" alt="InternTrail" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Features</a>
                <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">How It Works</a>
                <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Testimonials</a>
                <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">FAQ</a>
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Login</Link>
                <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Empowering Internships, Simplifying Management
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Streamline your internship journey with InternTrail. From application to certification,
                we make the process seamless for students and supervisors alike.
              </p>
              <div className="flex space-x-4">
                <Link to="/user-selection">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://img.freepik.com/free-vector/people-with-technology-devices_52683-34717.jpg?t=st=1741838356~exp=1741841956~hmac=497d6719973579d2484338c24da2f0d2454799d2b1ffe19e66e391f1cf7614fb&w=1380"
                alt="Internship Management"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Successful Internships
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Powerful features to make internship management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      {/* Add more sections as needed */}

    </div>
  );
}

const features = [
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor internship hours, tasks, and milestones in real-time with intuitive dashboards."
  },
  {
    icon: FileCheck,
    title: "Document Management",
    description: "Easily upload, store, and manage all internship-related documents in one place."
  },
  {
    icon: Users,
    title: "Collaboration Tools",
    description: "Connect with supervisors and coordinators seamlessly for better communication."
  },
  {
    icon: MessageSquare,
    title: "Feedback System",
    description: "Get timely feedback and evaluations from your supervisors to improve performance."
  },
  {
    icon: CheckCircle2,
    title: "Task Management",
    description: "Organize and track internship tasks with clear deadlines and priorities."
  },
  {
    icon: Star,
    title: "Certification",
    description: "Receive digital certificates upon successful completion of your internship."
  }
];

export default LandingPage; 