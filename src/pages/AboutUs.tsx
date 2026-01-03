export default function AboutUs() {
  return (
    <div className="dashboard-fullscreen">
      {/* Hero Section */}
      <div className="text-center py-16 mb-12 text-white px-4 w-full" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <h1 className="text-5xl font-bold mb-4 text-white">🏥 About RehabMotion</h1>
        <p className="text-2xl max-w-3xl mx-auto leading-relaxed text-white opacity-90">
          Revolutionizing rehabilitation through AI-powered technology and personalized care
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* Mission Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            RehabMotion is dedicated to making professional-grade rehabilitation accessible to everyone. 
            We combine technology with evidence-based physical therapy protocols to create 
            personalized recovery programs that adapt to your unique needs and progress.
          </p>
        </div>

        {/* Story Section */}
        <div className="rounded-xl border-2 p-12 mb-8" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderColor: 'rgba(102, 126, 234, 0.3)' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            RehabMotion was developed from a simple observation: too many people lack access to quality rehabilitation care. Whether due to cost, location, or time constraints, millions struggle to get the professional guidance they need to recover from injuries themselves.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            RehabMotion was created to bridge this gap, leveraging technology and computer vision to bring expert-level rehabilitation guidance directly to your home. Our platform
            uses real-time pose detection to ensure proper form, tracks your progress automatically,
            and adapts your program based on your recovery journey.
          </p>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🎯', title: 'Live Form Tracking', desc: 'Our advanced pose detection technology ensures you perform exercises correctly, counting reps and monitoring form in real-time.' },
              { icon: '📊', title: 'Personalized Programs', desc: 'Evidence-based rehabilitation plans customized to your specific injury, fitness level, and recovery goals.' },
              { icon: '🎓', title: 'Expert-Designed', desc: 'All programs are created by licensed physical therapists with years of clinical experience in sports rehabilitation.' },
              { icon: '📱', title: 'Accessible Anywhere', desc: 'Complete your rehabilitation exercises from home, the gym, or on the go. All you need is a device with a camera.' },
              { icon: '📈', title: 'Progress Tracking', desc: 'Visualize your recovery journey with detailed analytics, milestone tracking, and comprehensive progress reports.' },
              { icon: '🔒', title: 'Privacy First', desc: 'Your health data is encrypted and secure. We never share your information without your explicit consent.' }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all">
                <span className="text-5xl block mb-4">{feature.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            RehabMotion is powered by a diverse team of healthcare professionals who share a passion for improving healthcare accessibility. Our physical 
            therapists bring decades of combined clinical experience, while our engineers leverage 
            the latest in computer vision technology.
          </p>
        </div>

        {/* Impact Section */}
        <div className="rounded-xl border-2 p-12 mb-8" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderColor: 'rgba(102, 126, 234, 0.3)' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '10,000+', label: 'Active Users' },
              { num: '50,000+', label: 'Exercises Completed' },
              { num: '95%', label: 'User Satisfaction' },
              { num: '4.8/5', label: 'Average Rating' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-8 bg-white rounded-lg border-2 border-blue-600">
                <span className="block text-4xl font-bold text-blue-600 mb-2">{stat.num}</span>
                <span className="block text-base text-gray-600 font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Injuries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Injuries We Support</h2>
          <div className="space-y-6">
            {[
              { icon: '🦵', title: 'Knee Injuries', desc: 'ACL Tear, MCL Tear, Meniscus Tear' },
              { icon: '🦶', title: 'Ankle Injuries', desc: 'Lateral Ankle Sprain, Medial Ankle Sprain, High Ankle Sprain' },
            ].map((injury, idx) => (
              <div key={idx} className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <span className="text-5xl flex-shrink-0">{injury.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{injury.title}</h3>
                  <p className="text-gray-600">{injury.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Technology</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            RehabMotion uses Google MediaPipe Pose Landmarker for real-time pose detection and 
            exercise tracking. Our algorithms can detect 33 body landmarks with high accuracy, 
            enabling precise form analysis and automatic rep counting. The entire system runs 
            in your browser, ensuring privacy and instant feedback without server delays.
          </p>
        </div>

        {/* Values Section */}
        <div className="rounded-xl border-2 p-12 mb-8" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderColor: 'rgba(102, 126, 234, 0.3)' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: '💙 Patient-First', desc: 'Every decision we make prioritizes the health and well-being of our users.' },
              { title: '🔬 Evidence-Based', desc: 'Our programs are built on scientific research and proven clinical practices.' },
              { title: '🌟 Innovation', desc: 'We constantly push the boundaries of what is possible in digital healthcare.' },
              { title: '🤝 Accessibility', desc: 'Quality rehabilitation should be available to everyone, regardless of circumstances.' }
            ].map((value, idx) => (
              <div key={idx} className="p-8 bg-white rounded-lg border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
