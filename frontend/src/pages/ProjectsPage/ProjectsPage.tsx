import React from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, Clock, CheckSquare, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';
import { Button } from '@/design-system/primitives';

export function ProjectsPage() {
  const plannedCaseStudies = [
    {
      id: 'churn-prediction',
      title: 'Customer Churn Prediction in Telecommunications',
      domain: 'Customer Retention & Financial Services',
      problemStatement:
        'A telecom provider is losing customers to competitors. Build and benchmark supervised classification models to flag high-risk subscribers before contract expiry.',
      objectives: [
        'Formulate churn prediction as binary classification',
        'Impute missing values and encode categorical plan features',
        'Train Logistic Regression, Random Forest, and Gradient Boosting',
        'Optimize recall to prevent false negatives using custom decision thresholds',
      ],
      dataset: '10,000 synthetic subscriber records with usage, charges, and churn flags',
      suggestedAlgorithms: ['Logistic Regression', 'Random Forest Classifier', 'Gradient Boosting'],
      evaluationCriteria: 'F1 Macro, Recall on Positive Churn class, Precision-Recall AUC',
    },
    {
      id: 'housing-valuation',
      title: 'Real Estate Valuation & Hedonic Price Modeling',
      domain: 'Housing Economics & Urban Analytics',
      problemStatement:
        'Predict property sale prices based on physical attributes (area, rooms) and neighborhood statistics, evaluating non-linear tree ensembles versus regularized linear models.',
      objectives: [
        'Analyze collinearity between numerical square footage features',
        'Fit L1 (Lasso) and L2 (Ridge) regularized regression baselines',
        'Benchmark Random Forest Regressor against Linear Regression',
        'Inspect residual plots to detect heteroskedasticity and non-linearities',
      ],
      dataset: 'Housing sales dataset with continuous square footage and price targets',
      suggestedAlgorithms: ['Ridge Regression', 'Lasso Regression', 'Random Forest Regressor'],
      evaluationCriteria: 'Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), R² score',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      {/* Header */}
      <div className="border-b border-graphite-700 pb-8 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <ProvenanceBadge type="planned" subtext="Awaiting Backend Specification" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-bone-100">
          Guided <span className="text-cyan-400">Projects</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-steel-400 max-w-3xl leading-relaxed font-mono">
          Guided end-to-end case studies bridging theoretical concepts with end-to-end laboratory execution.
        </p>
      </div>

      {/* Honest Planned Notice */}
      <div className="mb-10 p-5 border border-dashed border-graphite-600 bg-graphite-800/20 rounded-sm space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-steel-300">
          <Clock className="w-4 h-4 text-steel-400" />
          <span>Feature Architecture Preview</span>
        </div>
        <p className="text-xs text-steel-400 font-sans leading-relaxed">
          The backend API currently does not expose an interactive <code>/projects</code> persistence endpoint.
          Below is the verified project syllabus and specification planned for integration with Model Lab.
        </p>
      </div>

      {/* Case Studies Grid */}
      <div className="space-y-8">
        {plannedCaseStudies.map((project, idx) => (
          <div
            key={project.id}
            className="p-6 sm:p-8 border border-graphite-700 bg-graphite-850/40 rounded-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase font-bold tracking-wider">
                  Case Study 0{idx + 1} · {project.domain}
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-bone-100 mt-1">
                  {project.title}
                </h2>
              </div>
              <ProvenanceBadge type="planned" />
            </div>

            <div className="space-y-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-steel-400 font-bold">
                Problem Statement
              </h3>
              <p className="text-sm text-bone-100/90 leading-relaxed font-sans">
                {project.problemStatement}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-sans text-xs">
              <div className="space-y-2">
                <h4 className="font-mono uppercase tracking-wider text-steel-400 font-bold">
                  Step-by-Step Learning Tasks
                </h4>
                <ul className="space-y-1.5 text-bone-100/90">
                  {project.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-mono uppercase tracking-wider text-steel-400 font-bold mb-1">
                    Dataset Scope
                  </h4>
                  <p className="text-steel-400 leading-relaxed">{project.dataset}</p>
                </div>

                <div>
                  <h4 className="font-mono uppercase tracking-wider text-steel-400 font-bold mb-1">
                    Suggested Algorithms
                  </h4>
                  <div className="flex flex-wrap gap-1.5 font-mono">
                    {project.suggestedAlgorithms.map((algo) => (
                      <span
                        key={algo}
                        className="px-2 py-0.5 bg-ink-950 border border-graphite-700 text-bone-100 text-[11px]"
                      >
                        {algo}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono uppercase tracking-wider text-steel-400 font-bold mb-1">
                    Evaluation Criteria
                  </h4>
                  <p className="text-steel-400 font-mono text-[11px]">{project.evaluationCriteria}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-graphite-700/60 flex justify-end">
              <Link to="/model-lab">
                <Button variant="outline" size="sm" className="gap-2">
                  <span>Open Model Lab with Your Own Dataset</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
