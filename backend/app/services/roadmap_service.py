from typing import List, Dict

CURATED_TEMPLATES: Dict[str, Dict] = {
    "python": {
        "title": "Python for AI & Machine Learning Mastery",
        "description": "Comprehensive pedagogical pathway taking you from core Python syntax through numerical computing with NumPy, data analysis with Pandas, and practical model training with Scikit-Learn and PyTorch.",
        "topics": [
            {
                "title": "Python Syntax, Data Structures & Idiomatic Patterns",
                "duration": 30,
                "difficulty": "Easy",
                "summary": "Master core syntax, dynamic typing, list/dict comprehensions, functions, and error handling for data applications.",
                "description": "Learn the foundational constructs of Python 3: variable scope, mutable vs immutable types, collections, lambda expressions, and file I/O operations.",
                "learning_objectives": "• Write idiomatic list/dictionary comprehensions\n• Manipulate nested data structures and JSON records\n• Handle edge cases with try-except blocks and context managers"
            },
            {
                "title": "Vectorized Computing & Array Operations with NumPy",
                "duration": 40,
                "difficulty": "Medium",
                "summary": "High-performance numerical computing with multi-dimensional arrays, matrix products, and broadcasting.",
                "description": "Explore the backbone of modern AI: N-dimensional ndarrays, memory strides, vectorized operations, mathematical functions, and tensor shaping.",
                "learning_objectives": "• Create and reshape multi-dimensional ndarrays\n• Understand and apply NumPy broadcasting rules\n• Compute dot products, matrix inverses, and eigenvalues"
            },
            {
                "title": "Data Wrangling & Exploratory Analysis with Pandas",
                "duration": 45,
                "difficulty": "Medium",
                "summary": "Dataset loading, cleaning, grouping, filtering, and feature extraction using DataFrames.",
                "description": "Transform messy raw datasets into clean tabular features: handle missing values, merge multiple sources, pivot tables, and apply aggregation functions.",
                "learning_objectives": "• Load and index CSV/Parquet data into DataFrames\n• Impute missing data and clean categorical variables\n• Perform multi-level groupby aggregations and feature creation"
            },
            {
                "title": "Data Visualization with Matplotlib & Seaborn",
                "duration": 35,
                "difficulty": "Easy",
                "summary": "Visualizing loss curves, data distributions, correlation heatmaps, and regression lines.",
                "description": "Translate numerical patterns into compelling visual narratives: histograms, scatter matrices, box plots, and heatmaps for diagnostic insights.",
                "learning_objectives": "• Plot publication-ready figures with custom subplots\n• Construct correlation heatmaps and pair plots\n• Graph training loss curves and evaluation metrics"
            },
            {
                "title": "Machine Learning with Scikit-Learn: Regression & Classification",
                "duration": 50,
                "difficulty": "Hard",
                "summary": "End-to-end predictive modeling: train/test splitting, standardization, model training, and cross-validation.",
                "description": "Implement classical algorithms including Linear/Logistic Regression, Decision Trees, Random Forests, and evaluate using Precision, Recall, and ROC-AUC.",
                "learning_objectives": "• Build reproducible sklearn Pipelines\n• Tune hyperparameters using GridSearchCV\n• Evaluate model generalization with stratified K-fold cross-validation"
            },
            {
                "title": "Deep Learning Prerequisites: Tensors & Autograd in PyTorch",
                "duration": 60,
                "difficulty": "Hard",
                "summary": "Transitioning to neural networks: GPU tensors, automatic differentiation, and training your first network.",
                "description": "Understand computational graphs, gradient tracking with requires_grad=True, writing backward passes, and implementing a PyTorch training loop.",
                "learning_objectives": "• Define neural network architectures using torch.nn.Module\n• Implement forward and backward passes with optimizers\n• Train a multi-layer perceptron on image/tabular benchmarks"
            }
        ]
    },
    "neural networks": {
        "title": "Neural Networks & Deep Learning Foundations",
        "description": "Master perceptron mathematics, backpropagation calculus, activation functions, and optimizer dynamics.",
        "topics": [
            {
                "title": "Perceptrons & Linear Decision Boundaries",
                "duration": 25,
                "difficulty": "Easy",
                "summary": "Mathematical formulation of artificial neurons and dot products.",
                "description": "Examine single-layer perceptrons, weight vectors, bias shifts, and linear separability limitations (XOR problem).",
                "learning_objectives": "• Calculate dot products of weights and input features\n• Plot linear decision boundaries\n• Understand why multi-layer networks are required for non-linear separation"
            },
            {
                "title": "Activation Functions (ReLU, Sigmoid, GELU)",
                "duration": 30,
                "difficulty": "Easy",
                "summary": "Why non-linearity is essential for multi-layer representation power.",
                "description": "Contrast mathematical properties of Sigmoid, Tanh, ReLU, LeakyReLU, and modern GELU/Swish functions.",
                "learning_objectives": "• Explain the vanishing gradient problem in saturating activations\n• Understand non-linear function approximation\n• Select appropriate activation functions for hidden vs output layers"
            },
            {
                "title": "Cost Functions & Cross-Entropy Loss",
                "duration": 35,
                "difficulty": "Medium",
                "summary": "Deriving loss functions and measuring prediction divergence.",
                "description": "Explore Mean Squared Error (MSE), Binary Cross-Entropy, and Categorical Cross-Entropy with Softmax.",
                "learning_objectives": "• Derive the cross-entropy formula from maximum likelihood estimation\n• Compute loss values for multi-class classification\n• Interpret negative log-likelihood penalties"
            },
            {
                "title": "Backpropagation & Chain Rule Gradients",
                "duration": 45,
                "difficulty": "Hard",
                "summary": "Propagating errors backward through computational graphs.",
                "description": "Step-by-step multivariate chain rule differentiation propagating error signals from output layer back to input weights.",
                "learning_objectives": "• Construct computational graphs for forward and backward passes\n• Calculate partial derivatives using the multivariate chain rule\n• Implement a manual two-layer backprop algorithm in Python"
            },
            {
                "title": "Optimizers: SGD, Momentum, and Adam",
                "duration": 40,
                "difficulty": "Hard",
                "summary": "Adaptive learning rates and navigating loss landscapes.",
                "description": "Overcome saddle points, local minima, and ravines using first-moment momentum and second-moment RMSProp scaling in Adam.",
                "learning_objectives": "• Understand velocity accumulation in Momentum SGD\n• Explain how Adam balances learning rates across sparse features\n• Tune learning rates and decay schedules effectively"
            },
            {
                "title": "Overfitting & Regularization (Dropout, L2)",
                "duration": 35,
                "difficulty": "Medium",
                "summary": "Preventing variance explosion and stabilizing training.",
                "description": "Techniques for model generalization: L1/L2 weight penalties, Dropout probability masks, and Early Stopping.",
                "learning_objectives": "• Apply L2 weight decay to penalize large parameters\n• Implement inverted Dropout during training and inference\n• Monitor validation curves to prevent test error degradation"
            }
        ]
    },
    "machine learning": {
        "title": "Applied Machine Learning & Statistical Modeling",
        "description": "End-to-end predictive modeling from exploratory data analysis to feature engineering and ensemble algorithms.",
        "topics": [
            {
                "title": "Supervised vs Unsupervised Learning Paradigms",
                "duration": 20,
                "difficulty": "Easy",
                "summary": "Core taxonomy and mapping problems to algorithm families.",
                "description": "Categorize regression, classification, clustering, and dimensionality reduction problems.",
                "learning_objectives": "• Distinguish labelled vs unlabelled learning setups\n• Formulate real-world business problems as ML objectives\n• Choose appropriate baseline models"
            },
            {
                "title": "Linear & Logistic Regression from First Principles",
                "duration": 35,
                "difficulty": "Medium",
                "summary": "Gradient descent optimization for classification and continuous targets.",
                "description": "Understand hypothesis functions, odds ratios, cost functions, and batch vs stochastic gradient descent.",
                "learning_objectives": "• Implement ordinary least squares and gradient descent\n• Interpret logistic regression odds ratios and decision thresholds\n• Evaluate residuals and diagnostic plots"
            },
            {
                "title": "Decision Trees, Random Forests & XGBoost",
                "duration": 45,
                "difficulty": "Hard",
                "summary": "Information gain, gini impurity, and gradient boosted ensembles.",
                "description": "Explore recursive binary splitting, bagging, bootstrapping, and sequential residual reduction in gradient boosting.",
                "learning_objectives": "• Calculate Gini Impurity and Entropy splits\n• Explain the variance reduction mechanism of Random Forests\n• Train and tune XGBoost gradient boosted ensembles"
            },
            {
                "title": "Feature Engineering & Dimensionality Reduction (PCA)",
                "duration": 40,
                "difficulty": "Medium",
                "summary": "Eigenvectors, variance retention, and robust preprocessing pipelines.",
                "description": "Transform raw signals into predictive features using scaling, one-hot encoding, polynomial features, and PCA projection.",
                "learning_objectives": "• Standardize feature distributions\n• Compute covariance matrices and principal components\n• Project high-dimensional vectors onto maximum-variance orthogonal axes"
            },
            {
                "title": "Cross-Validation, ROC-AUC, and Evaluation Metrics",
                "duration": 30,
                "difficulty": "Medium",
                "summary": "Rigorous validation methodologies and confusion matrix analysis.",
                "description": "Understand precision-recall trade-offs, Area Under the ROC Curve, and stratified K-fold cross-validation.",
                "learning_objectives": "• Construct confusion matrices and calculate F1-scores\n• Plot and interpret ROC and Precision-Recall curves\n• Prevent data leakage across train and validation splits"
            }
        ]
    },
    "data structures": {
        "title": "Data Structures & Algorithmic Thinking",
        "description": "Master algorithmic time/space complexity, recursive state exploration, and advanced data structures.",
        "topics": [
            {
                "title": "Asymptotic Analysis (Big-O, Omega, Theta)",
                "duration": 25,
                "difficulty": "Easy",
                "summary": "Analyzing runtime growth curves and memory bounds.",
                "description": "Evaluate algorithmic efficiency in best, worst, and average cases using asymptotic mathematical notation.",
                "learning_objectives": "• Derive Big-O time and space complexity\n• Compare polynomial, logarithmic, and exponential runtimes\n• Analyze recursion trees using the Master Theorem"
            },
            {
                "title": "Dynamic Arrays, Hash Maps & Collision Resolution",
                "duration": 35,
                "difficulty": "Medium",
                "summary": "Amortized constant time lookups and probing techniques.",
                "description": "Internal workings of arrays and hash tables: hash functions, load factors, chaining, and open addressing.",
                "learning_objectives": "• Explain amortized O(1) array doubling\n• Implement hash table collision handling via chaining\n• Optimize lookup-heavy algorithms using sets and maps"
            },
            {
                "title": "Trees, Heaps & Priority Queues",
                "duration": 40,
                "difficulty": "Medium",
                "summary": "Binary search trees, heap invariant, and priority scheduling.",
                "description": "Explore tree traversals (pre, in, post, level order), balanced BSTs, and binary min/max heap operations.",
                "learning_objectives": "• Maintain the binary search tree invariant\n• Perform heapify, insert, and extract-min in O(log N)\n• Implement Dijkstra-style priority queues"
            },
            {
                "title": "Graph Algorithms: BFS, DFS & Shortest Paths",
                "duration": 50,
                "difficulty": "Hard",
                "summary": "Shortest paths, topological sorting, and cycle detection.",
                "description": "Represent graphs via adjacency lists; traverse with queues and stacks; compute shortest paths with Dijkstra's algorithm.",
                "learning_objectives": "• Implement Breadth-First and Depth-First searches\n• Detect cycles in directed and undirected graphs\n• Solve single-source shortest path problems"
            },
            {
                "title": "Dynamic Programming: 1D & 2D Recurrences",
                "duration": 55,
                "difficulty": "Hard",
                "summary": "Optimal substructure, overlapping subproblems, memoization vs tabulation.",
                "description": "Break complex exponential problems into cached polynomial solutions: Fibonacci, Knapsack, and Longest Common Subsequence.",
                "learning_objectives": "• Formulate recursive state transitions\n• Convert top-down memoization to bottom-up iterative tabulation\n• Optimize memory footprint using rolling variables"
            }
        ]
    },
    "distributed systems": {
        "title": "Distributed Systems & Cloud Architecture",
        "description": "Learn consensus protocols, message partitioning, fault tolerance, and eventual consistency patterns.",
        "topics": [
            {
                "title": "The CAP Theorem & PACELC Trade-Offs",
                "duration": 30,
                "difficulty": "Easy",
                "summary": "Consistency, availability, and network partitioning fundamentals.",
                "description": "Analyze fundamental limits of distributed databases when networks delay or drop packets.",
                "learning_objectives": "• Distinguish strong consistency from eventual consistency\n• Evaluate system trade-offs under network partitions\n• Map real-world databases to CP or AP classifications"
            },
            {
                "title": "Consensus Protocols: Raft & Paxos Intuition",
                "duration": 50,
                "difficulty": "Hard",
                "summary": "Leader elections, log replication, and safety guarantees.",
                "description": "Understand how independent machines agree on a sequence of state machine operations despite crashes.",
                "learning_objectives": "• Trace Raft leader election terms and candidate states\n• Explain log replication and commit index safety\n• Analyze quorum requirements and split-brain resolution"
            },
            {
                "title": "Event-Driven Messaging & Idempotency",
                "duration": 40,
                "difficulty": "Medium",
                "summary": "Publish-subscribe models, at-least-once delivery, and deduplication.",
                "description": "Build asynchronous architectures with queues and event streams, handling duplicate delivery gracefully.",
                "learning_objectives": "• Design idempotent consumer handlers\n• Understand dead-letter queues and retry backoffs\n• Decouple microservices using pub-sub topics"
            },
            {
                "title": "Data Partitioning & Consistent Hashing",
                "duration": 35,
                "difficulty": "Medium",
                "summary": "Virtual nodes, rehashing minimization, and horizontal scalability.",
                "description": "Distribute data across hundreds of storage nodes without mass data migration when nodes join or leave.",
                "learning_objectives": "• Implement consistent hashing rings with virtual nodes\n• Partition keys uniformly across nodes\n• Handle node addition and removal with minimal rebalancing"
            }
        ]
    }
}

def generate_roadmap(subject: str, level: str = "Beginner", custom_goal: str = None, goal: str = None) -> Dict:
    """
    Generates a structured, pedagogical roadmap for any subject and level.
    Uses curated patterns if matched, or intelligently synthesizes 5-6 progressive modules.
    Each topic includes title, description, learning_objectives, duration_minutes, and difficulty.
    """
    clean_sub = subject.lower().strip()
    effective_goal = custom_goal or goal or ""
    clean_goal = effective_goal.lower().strip()

    # Search for curated match
    matched_template = None
    matched_subject = subject.title()
    for key, template in CURATED_TEMPLATES.items():
        if key in clean_sub or clean_sub in key or (clean_goal and key in clean_goal):
            matched_template = template
            matched_subject = key.title()
            break

    # If subject or goal references Python, our Python template matches
    if not matched_template and ("python" in clean_sub or "python" in clean_goal):
        matched_template = CURATED_TEMPLATES["python"]
        matched_subject = "Python"

    if matched_template:
        topics_data = []
        for i, t in enumerate(matched_template["topics"]):
            status = "in-progress" if i == 0 else "locked"
            topics_data.append({
                "title": t["title"],
                "order": i + 1,
                "status": status,
                "duration_minutes": t.get("duration", 30),
                "difficulty": t.get("difficulty", "Medium"),
                "summary": t.get("summary", ""),
                "description": t.get("description", t.get("summary", "")),
                "learning_objectives": t.get("learning_objectives", f"• Master core principles of {t['title']}\n• Complete practical exercises"),
                "mastery_score": 0
            })

        display_title = matched_template["title"]
        if effective_goal:
            display_title = f"{matched_subject} Roadmap: {effective_goal}"

        return {
            "title": display_title,
            "subject": matched_subject,
            "level": level,
            "description": matched_template["description"],
            "topics": topics_data
        }

    # Dynamic algorithmic synthesis for arbitrary subjects (e.g. Rust, DevOps, Blockchain, etc.)
    title = f"{subject.title()} Roadmap" + (f": {effective_goal}" if effective_goal else " Mastery Track")
    description = f"Structured progressive pathway to master {subject.title()} at {level} level" + (f" with focus on: {effective_goal}" if effective_goal else ".")

    stages = [
        {
            "suffix": "Core Syntax & Foundations",
            "diff": "Easy",
            "mins": 30,
            "desc": f"Fundamental terminology, environment setup, and baseline mental models for {subject}.",
            "objs": f"• Set up development environment for {subject}\n• Understand primitive types and control structures\n• Write initial verification scripts"
        },
        {
            "suffix": "Core Principles & Architectural Patterns",
            "diff": "Medium",
            "mins": 40,
            "desc": f"Deep dive into how {subject} operates in real-world scenarios and production applications.",
            "objs": f"• Explore standard libraries and idioms of {subject}\n• Design modular components and functions\n• Apply clean code standards"
        },
        {
            "suffix": "Hands-on Practical Implementation",
            "diff": "Medium",
            "mins": 45,
            "desc": f"Hands-on lab exercises and practical project implementation in {subject}.",
            "objs": f"• Build working functional prototypes\n• Handle data inputs and error states\n• Write unit tests for business logic"
        },
        {
            "suffix": "Optimization, Debugging & Best Practices",
            "diff": "Hard",
            "mins": 50,
            "desc": f"Troubleshooting common pitfalls, bottlenecks, and performance tuning for {subject}.",
            "objs": f"• Diagnose edge cases and performance bottlenecks\n• Optimize memory and compute utilization\n• Implement logging and telemetry"
        },
        {
            "suffix": "Capstone Integration & Practical Mastery",
            "diff": "Hard",
            "mins": 60,
            "desc": f"End-to-end capstone project synthesizing all concepts acquired in {subject}.",
            "objs": f"• Architect an integrated multi-tier project\n• Conduct peer code review and benchmarking\n• Validate complete domain mastery"
        }
    ]

    topics_data = []
    for i, stage in enumerate(stages):
        status = "in-progress" if i == 0 else "locked"
        topic_title = f"{subject.title()}: {stage['suffix']}"
        topics_data.append({
            "title": topic_title,
            "order": i + 1,
            "status": status,
            "duration_minutes": stage["mins"],
            "difficulty": stage["diff"],
            "summary": stage["desc"],
            "description": stage["desc"],
            "learning_objectives": stage["objs"],
            "mastery_score": 0
        })

    return {
        "title": title,
        "subject": subject.title(),
        "level": level,
        "description": description,
        "topics": topics_data
    }
