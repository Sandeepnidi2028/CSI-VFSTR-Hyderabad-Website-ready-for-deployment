import React, { useState, useEffect } from 'react';
import { projectsService } from '../services/api';
import { ProjectItem } from '../types';
import {
  Code2,
  Github,
  ExternalLink,
  Users,
  Layers,
  Sparkles
} from 'lucide-react';
import { getImageUrl, FALLBACK_PROJECT_IMAGE } from '../utils/imageUrl';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsService.getAll()
      .then((data) => setProjects(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 py-12 min-h-[85vh]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Student Innovation
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900">
            CSI Student Projects
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Real-world software architectures, IoT prototypes, and open source applications built by VFSTR student developers.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <Code2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Projects Published Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Projects submitted by student developers will be featured here upon administrator review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  {project.image ? (
                    <img
                      src={getImageUrl(project.image)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PROJECT_IMAGE;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center tech-grid-bg text-slate-500 p-4">
                      <Layers className="w-10 h-10 text-cyan-400/40 mb-2" />
                      <span className="text-xs font-semibold text-slate-400">CSI Project</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {/* Tech stack */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Contributors */}
                    {project.teamMembers && project.teamMembers.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                        <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">By {project.teamMembers.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>Repository</span>
                      </a>
                    ) : <span />}

                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all hover:scale-105"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
