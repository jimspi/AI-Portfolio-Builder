import React, { useState } from 'react';
import { Sparkles, Link2, ArrowRight, Plus, X, Share2, ExternalLink } from 'lucide-react';

export default function AIShowcasePlatform() {
  const [view, setView] = useState('create'); // 'create' or 'preview'
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    projects: []
  });
  const [currentProject, setCurrentProject] = useState({
    name: '',
    description: '',
    useCase: '',
    tools: '',
    link: '',
    previewImage: ''
  });
  const [shareableLink, setShareableLink] = useState('');
  const [editLink, setEditLink] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [portfolioId, setPortfolioId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'

  const addProject = () => {
    if (currentProject.name && currentProject.description) {
      setFormData({
        ...formData,
        projects: [...formData.projects, { ...currentProject, id: Date.now() }]
      });
      setCurrentProject({ name: '', description: '', useCase: '', tools: '', link: '', previewImage: '' });
    }
  };

  const removeProject = (id) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter(p => p.id !== id)
    });
  };

  const generateLink = async () => {
    const id = portfolioId || Math.random().toString(36).substring(2, 15);
    setPortfolioId(id);
    
    const publicLink = `${window.location.origin}/showcase/${id}`;
    const editLinkUrl = `${window.location.origin}/edit/${id}`;
    
    setShareableLink(publicLink);
    setEditLink(editLinkUrl);
    
    // Save portfolio data
    await savePortfolio(id);
    
    generateAISummary();
    setView('preview');
  };

  const savePortfolio = async (id) => {
    setSaveStatus('saving');
    
    const portfolioData = {
      id,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    try {
      // This will call your Vercel API endpoint to save the portfolio
      const response = await fetch('/api/save-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData)
      });

      if (response.ok) {
        setSaveStatus('saved');
        
        // Also save to localStorage as backup
        const savedPortfolios = JSON.parse(localStorage.getItem('myPortfolios') || '[]');
        const existingIndex = savedPortfolios.findIndex(p => p.id === id);
        
        if (existingIndex >= 0) {
          savedPortfolios[existingIndex] = portfolioData;
        } else {
          savedPortfolios.push(portfolioData);
        }
        
        localStorage.setItem('myPortfolios', JSON.stringify(savedPortfolios));
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.log('Saving to localStorage only - API not available yet');
      
      // Fallback: save only to localStorage
      const savedPortfolios = JSON.parse(localStorage.getItem('myPortfolios') || '[]');
      const existingIndex = savedPortfolios.findIndex(p => p.id === id);
      
      if (existingIndex >= 0) {
        savedPortfolios[existingIndex] = portfolioData;
      } else {
        savedPortfolios.push(portfolioData);
      }
      
      localStorage.setItem('myPortfolios', JSON.stringify(savedPortfolios));
      setSaveStatus('saved');
    }
  };

  const loadPortfolio = (id) => {
    // Try to load from localStorage first
    const savedPortfolios = JSON.parse(localStorage.getItem('myPortfolios') || '[]');
    const portfolio = savedPortfolios.find(p => p.id === id);
    
    if (portfolio) {
      setFormData({
        name: portfolio.name,
        title: portfolio.title,
        bio: portfolio.bio,
        projects: portfolio.projects
      });
      setPortfolioId(id);
      return true;
    }
    
    // In production, this would also fetch from your database via API
    return false;
  };

  const loadFromEditLink = () => {
    const path = window.location.pathname;
    if (path.startsWith('/edit/')) {
      const id = path.replace('/edit/', '');
      loadPortfolio(id);
    }
  };

  // Load portfolio on mount if edit link is used
  React.useEffect(() => {
    loadFromEditLink();
  }, []);

  const generateAISummary = async () => {
    setGeneratingSummary(true);
    
    // Prepare data for AI summary
    const portfolioData = {
      name: formData.name,
      title: formData.title,
      bio: formData.bio,
      projects: formData.projects.map(p => ({
        name: p.name,
        description: p.description,
        useCase: p.useCase,
        tools: p.tools
      }))
    };

    try {
      // This will call your Vercel API endpoint
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData)
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
      } else {
        // Fallback summary if API fails
        setAiSummary(`${formData.name} is an AI enthusiast who has developed ${formData.projects.length} innovative projects spanning ${[...new Set(formData.projects.map(p => p.useCase).filter(Boolean))].join(', ')}. Their work demonstrates expertise with ${[...new Set(formData.projects.flatMap(p => p.tools.split(',').map(t => t.trim())).filter(Boolean))].slice(0, 5).join(', ')}.`);
      }
    } catch (error) {
      // Fallback summary if fetch fails
      console.log('Using fallback summary - API not available yet');
      setAiSummary(`${formData.name} is an AI enthusiast who has developed ${formData.projects.length} innovative projects spanning ${[...new Set(formData.projects.map(p => p.useCase).filter(Boolean))].join(', ')}. Their work demonstrates expertise with ${[...new Set(formData.projects.flatMap(p => p.tools.split(',').map(t => t.trim())).filter(Boolean))].slice(0, 5).join(', ')}.`);
    }
    
    setGeneratingSummary(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    alert('Link copied to clipboard!');
  };

  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Share Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 sticky top-0 z-50 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 size={20} />
              <span className="font-medium">Your AI Portfolio is Live!</span>
              {saveStatus === 'saved' && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">✓ Auto-saved</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white placeholder-white/60 border border-white/30 w-80 text-sm"
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition flex items-center gap-2 whitespace-nowrap"
                  >
                    <Link2 size={18} />
                    Copy Share Link
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editLink}
                    readOnly
                    className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white placeholder-white/60 border border-white/30 w-80 text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(editLink);
                      alert('Edit link copied! Save this to edit your portfolio later.');
                    }}
                    className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg font-medium hover:bg-white/20 transition flex items-center gap-2 whitespace-nowrap"
                  >
                    <Link2 size={18} />
                    Copy Edit Link
                  </button>
                </div>
              </div>
              <button
                onClick={() => setView('create')}
                className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg font-medium hover:bg-white/20 transition"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Landing Page Preview */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full mb-6">
              <Sparkles size={18} />
              <span className="font-medium">AI Portfolio</span>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {formData.name || 'Your Name'}
            </h1>
            <p className="text-2xl text-gray-600 mb-4">{formData.title || 'AI Enthusiast & Builder'}</p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {formData.bio || 'Exploring the frontiers of artificial intelligence and building innovative solutions.'}
            </p>
          </div>

          {/* AI-Generated Summary Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                  <Sparkles className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">AI-Generated Portfolio Summary</h2>
              </div>
              
              {generatingSummary ? (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <p>Analyzing your projects and generating insights...</p>
                </div>
              ) : (
                <p className="text-lg text-gray-700 leading-relaxed italic">
                  "{aiSummary}"
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Sparkles size={14} />
                  This summary was automatically generated using AI based on all portfolio projects
                </p>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
              AI Projects & Use Cases
            </h2>
            <div className="grid gap-6">
              {formData.projects.map((project, index) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Project Preview Image/Window */}
                  {project.previewImage && (
                    <div className="relative h-64 bg-gradient-to-br from-blue-100 to-cyan-100 overflow-hidden">
                      <img
                        src={project.previewImage}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  
                  {/* Project Content */}
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{project.name}</h3>
                      <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                        {project.useCase || 'Use Case'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                    
                    {/* Tools */}
                    {project.tools && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tools.split(',').map((tool, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                          >
                            {tool.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Project Link */}
                    {project.link && (
                      <
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all group"
                      >
                        <span>View Project</span>
                        <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Footer */}
          <div className="text-center pt-12 border-t border-gray-200">
            <p className="text-gray-500">
              Built with the AI Portfolio Platform • Showcasing innovation and learning
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI Portfolio Builder
            </h1>
          </div>
          <button
            onClick={generateLink}
            disabled={!formData.name || formData.projects.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Generate Portfolio
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Showcase Your AI Journey
          </h2>
          <p className="text-lg text-gray-600">
            Create a beautiful portfolio to share your AI projects, use cases, and achievements
          </p>
          {portfolioId && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                ✓ Editing existing portfolio • Changes will be auto-saved
              </p>
            </div>
          )}
        </div>

        {/* Personal Info Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
            Personal Information
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="AI Engineer | Machine Learning Enthusiast"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                placeholder="Share a bit about your AI journey and what drives your passion..."
              />
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
            Add AI Projects *
          </h3>

          {/* Current Projects */}
          {formData.projects.length > 0 && (
            <div className="mb-6 space-y-3">
              {formData.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {project.previewImage && (
                      <img
                        src={project.previewImage}
                        alt={project.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        {project.link && (
                          <ExternalLink size={14} className="text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{project.description.substring(0, 60)}...</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeProject(project.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Project Form */}
          <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
            <div>
              <input
                type="text"
                value={currentProject.name}
                onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="Project Name *"
              />
            </div>

            <div>
              <input
                type="text"
                value={currentProject.useCase}
                onChange={(e) => setCurrentProject({ ...currentProject, useCase: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="Use Case (e.g., Content Generation, Data Analysis)"
              />
            </div>

            <div>
              <textarea
                value={currentProject.description}
                onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                placeholder="Describe what you built and what you learned *"
              />
            </div>

            <div>
              <input
                type="text"
                value={currentProject.tools}
                onChange={(e) => setCurrentProject({ ...currentProject, tools: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="AI Tools Used (comma-separated: ChatGPT, Claude, Midjourney)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Link (URL to your product/demo)
              </label>
              <input
                type="url"
                value={currentProject.link}
                onChange={(e) => setCurrentProject({ ...currentProject, link: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="https://your-project.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Image URL (screenshot or preview of your project)
              </label>
              <input
                type="url"
                value={currentProject.previewImage}
                onChange={(e) => setCurrentProject({ ...currentProject, previewImage: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="https://example.com/project-screenshot.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Use a screenshot hosting service or your project's main image
              </p>
            </div>

            <button
              onClick={addProject}
              disabled={!currentProject.name || !currentProject.description}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Project
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-gray-500 text-sm">
          <p>Add your personal info and at least one project to generate your portfolio</p>
        </div>
      </div>
    </div>
  );
}
