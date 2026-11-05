import json
from typing import List, Dict
from sqlalchemy.orm import Session
from ..models import QuizQuestion

BUILTIN_QUESTIONS: List[Dict] = [
    # 1. Backpropagation & Deep Learning
    {
        "topic_name": "Backpropagation & Gradient Descent",
        "question": "What mathematical principle allows gradients to be computed backward through multiple layers in a neural network?",
        "options": [
            "L'Hôpital's Rule",
            "The Chain Rule of Calculus",
            "Taylor Series Expansion",
            "Euler's Totient Theorem"
        ],
        "correct_index": 1,
        "explanation": "Backpropagation recursively applies the chain rule of multivariate calculus to calculate the partial derivative of the loss function with respect to every weight.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Backpropagation & Gradient Descent",
        "question": "Why does standard Stochastic Gradient Descent (SGD) struggle on shallow plateau regions or saddle points?",
        "options": [
            "The gradient magnitude becomes near zero, causing updates to stall",
            "The learning rate automatically increases to infinity",
            "The weights convert into non-linear functions",
            "The loss function becomes discontinuous"
        ],
        "correct_index": 0,
        "explanation": "On saddle points or flat plateaus, the gradient ∇L approaches zero. Without momentum, SGD takes imperceptibly small steps.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Backpropagation & Gradient Descent",
        "question": "How does the Adam optimizer mitigate the limitations of standard gradient descent?",
        "options": [
            "It drops random weights on each forward pass",
            "It combines momentum (1st moment) with adaptive RMSProp scaling (2nd moment)",
            "It converts floating point arithmetic to integers",
            "It eliminates the backward pass entirely"
        ],
        "correct_index": 1,
        "explanation": "Adam maintains both an exponentially decaying average of past gradients (momentum) and past squared gradients (RMSProp adaptive scale).",
        "is_ai_generated": False
    },

    # 2. Activation Functions
    {
        "topic_name": "Activation Functions",
        "question": "What is the primary reason non-linear activation functions like ReLU are required in deep neural networks?",
        "options": [
            "To reduce memory usage on GPU VRAM",
            "Without non-linearity, stacking multiple layers collapses mathematically into a single linear transformation",
            "To ensure all output values are strictly negative",
            "To make gradient computation impossible"
        ],
        "correct_index": 1,
        "explanation": "Matrix multiplication of linear layers is just another linear transformation: W2*(W1*x) = (W2*W1)*x = W_combined*x. Non-linearities enable universal function approximation.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Activation Functions",
        "question": "What is the 'Dying ReLU' problem?",
        "options": [
            "When neurons output NaN due to division by zero",
            "When neurons enter a state where output is 0 for all inputs, resulting in a 0 gradient that permanently prevents updates",
            "When activation values grow exponentially to infinity",
            "When the loss function decreases too quickly"
        ],
        "correct_index": 1,
        "explanation": "If a neuron's weighted sum is negative, ReLU outputs 0 and its gradient is 0. If it stays negative across the dataset, the neuron never updates again.",
        "is_ai_generated": False
    },

    # 3. Distributed Systems
    {
        "topic_name": "Distributed Systems",
        "question": "According to the CAP theorem, what trade-off must a distributed database make in the presence of a network partition (P)?",
        "options": [
            "It must sacrifice Security",
            "It must choose between Consistency (all nodes see same data) and Availability (every request receives non-error response)",
            "It must delete all stored data",
            "It must convert into a single-threaded process"
        ],
        "correct_index": 1,
        "explanation": "During a network partition, you can either keep responding to writes (Availability) at the cost of stale reads, or refuse writes to preserve consistency (Consistency).",
        "is_ai_generated": False
    },
    {
        "topic_name": "Distributed Systems",
        "question": "In the Raft consensus protocol, what happens when a follower node does not receive a heartbeat from the leader within its election timeout?",
        "options": [
            "It immediately shuts down",
            "It transitions to the Candidate state and initiates a new leader election",
            "It deletes its persistent write-ahead log",
            "It transmits data directly to external clients"
        ],
        "correct_index": 1,
        "explanation": "Raft uses randomized election timeouts. If a follower detects leader silence, it increments its term, votes for itself, and requests votes from peers.",
        "is_ai_generated": False
    },

    # 4. Data Structures & Algorithms
    {
        "topic_name": "Data Structures & Algorithms",
        "question": "What is the amortized time complexity of inserting an element into a dynamic array (like Python list or C++ std::vector)?",
        "options": [
            "O(1)",
            "O(log N)",
            "O(N)",
            "O(N^2)"
        ],
        "correct_index": 0,
        "explanation": "While resizing costs O(N) when capacity doubles, the doubling happens infrequently enough that the average (amortized) cost per append is O(1).",
        "is_ai_generated": False
    },
    {
        "topic_name": "Data Structures & Algorithms",
        "question": "Which algorithmic design paradigm is best suited for problems exhibiting 'optimal substructure' and 'overlapping subproblems'?",
        "options": [
            "Greedy Approach",
            "Divide and Conquer",
            "Dynamic Programming",
            "Randomized Las Vegas"
        ],
        "correct_index": 2,
        "explanation": "Dynamic programming avoids redundant exponential work by caching overlapping intermediate results (memoization or tabulation).",
        "is_ai_generated": False
    },

    # 5. Python Syntax & Fundamentals
    {
        "topic_name": "Python Syntax, Data Structures & Idiomatic Patterns",
        "question": "What is the primary difference between a Python list and a Python tuple?",
        "options": [
            "Tuples are mutable while lists are immutable",
            "Lists are mutable while tuples are immutable",
            "Lists can only store integers while tuples store strings",
            "Tuples cannot be indexed or sliced"
        ],
        "correct_index": 1,
        "explanation": "Lists can be modified in-place (mutable: append, pop, sort), whereas tuples cannot be altered after creation (immutable), making them hashable as dictionary keys.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Python Syntax, Data Structures & Idiomatic Patterns",
        "question": "What is the output of the Python list comprehension `[x**2 for x in range(5) if x % 2 == 0]`?",
        "options": [
            "[0, 4, 16]",
            "[1, 9, 25]",
            "[0, 1, 4, 9, 16]",
            "[4, 16]"
        ],
        "correct_index": 0,
        "explanation": "`range(5)` generates 0, 1, 2, 3, 4. Even numbers are 0, 2, 4. Their squares are 0, 4, and 16.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Python Syntax, Data Structures & Idiomatic Patterns",
        "question": "Which Python built-in mechanism guarantees cleanup of resources (like closing files or network sockets), even if an unhandled exception occurs?",
        "options": [
            "The `global` declaration",
            "Context managers using the `with` statement",
            "The `pass` keyword",
            "Lambda functions"
        ],
        "correct_index": 1,
        "explanation": "Context managers implement `__enter__` and `__exit__` magic methods, ensuring cleanup in `__exit__` runs regardless of whether an exception was raised.",
        "is_ai_generated": False
    },

    # 6. NumPy Foundations
    {
        "topic_name": "Vectorized Computing & Array Operations with NumPy",
        "question": "Why is NumPy array computation significantly faster than iterating over Python lists in a for-loop?",
        "options": [
            "NumPy uses cloud server clusters automatically",
            "NumPy arrays store contiguous C-memory blocks and execute vectorized SIMD CPU instructions without Python interpreter overhead",
            "Python lists store compressed binary strings",
            "NumPy disables memory allocation entirely"
        ],
        "correct_index": 1,
        "explanation": "NumPy arrays are homogeneous, contiguous memory buffers executed via compiled C and Fortran BLAS routines with SIMD vectorization.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Vectorized Computing & Array Operations with NumPy",
        "question": "Under NumPy broadcasting rules, what is the resulting shape of broadcasting an array of shape `(3, 1)` with an array of shape `(1, 4)`?",
        "options": [
            "(3, 4)",
            "(4, 3)",
            "(3, 1, 4)",
            "ValueError: shapes cannot broadcast"
        ],
        "correct_index": 0,
        "explanation": "Broadcasting compares dimensions element-wise from right to left: 1 and 4 yield 4; 3 and 1 yield 3. The resulting broadcasted array has shape (3, 4).",
        "is_ai_generated": False
    },
    {
        "topic_name": "Vectorized Computing & Array Operations with NumPy",
        "question": "Which NumPy function computes the matrix dot product between two 2D arrays `A` and `B`?",
        "options": [
            "A * B",
            "np.dot(A, B) or A @ B",
            "np.add(A, B)",
            "np.cross(A, B)"
        ],
        "correct_index": 1,
        "explanation": "`A * B` performs element-wise multiplication. For true matrix multiplication, use `np.dot(A, B)` or the `@` matrix operator.",
        "is_ai_generated": False
    },

    # 7. Pandas Data Wrangling
    {
        "topic_name": "Data Wrangling & Exploratory Analysis with Pandas",
        "question": "In Pandas, which method is used to remove or impute rows containing missing values (`NaN`)?",
        "options": [
            "df.drop_duplicates()",
            "df.dropna() or df.fillna()",
            "df.filter_nulls()",
            "df.strip()"
        ],
        "correct_index": 1,
        "explanation": "`dropna()` drops rows or columns containing missing values, while `fillna()` replaces `NaN` values with specified constants, means, or forward fills.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Data Wrangling & Exploratory Analysis with Pandas",
        "question": "How do you calculate the mean of column 'price' grouped by 'category' in a Pandas DataFrame `df`?",
        "options": [
            "df.group('category')['price'].sum()",
            "df.groupby('category')['price'].mean()",
            "df.sort_values('price').mean()",
            "df['price'].agg('category')"
        ],
        "correct_index": 1,
        "explanation": "`df.groupby('category')['price'].mean()` groups records by categorical values and computes the arithmetic mean for each group.",
        "is_ai_generated": False
    },

    # 8. Data Visualization with Matplotlib & Seaborn
    {
        "topic_name": "Data Visualization with Matplotlib & Seaborn",
        "question": "Which plot type is most suitable for visualizing the correlation matrix between numerical features in a dataset?",
        "options": [
            "Histogram",
            "Seaborn Heatmap (`sns.heatmap`)",
            "Pie Chart",
            "Stem Plot"
        ],
        "correct_index": 1,
        "explanation": "A heatmap with a color gradient displays pairwise Pearson/Spearman correlation coefficients cleanly across rows and columns.",
        "is_ai_generated": False
    },

    # 9. Scikit-Learn Machine Learning
    {
        "topic_name": "Machine Learning with Scikit-Learn: Regression & Classification",
        "question": "Why is it critical to split dataset into train and test sets before fitting machine learning models?",
        "options": [
            "To reduce RAM usage by half",
            "To evaluate generalization on unseen data and diagnose overfitting",
            "To make gradient descent converge in fewer iterations",
            "Because scikit-learn will throw a syntax error without it"
        ],
        "correct_index": 1,
        "explanation": "Evaluating on the training set risks measuring rote memorization (overfitting). Test sets assess how well the model generalizes to new data.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Machine Learning with Scikit-Learn: Regression & Classification",
        "question": "Which metric should be prioritized over overall accuracy when evaluating a machine learning model on an imbalanced dataset (e.g. 99% negative, 1% fraud)?",
        "options": [
            "Mean Squared Error (MSE)",
            "Precision, Recall, and F1-Score",
            "R-Squared (R²)",
            "Training loss only"
        ],
        "correct_index": 1,
        "explanation": "A dummy classifier predicting all negative achieves 99% accuracy while finding zero fraud. Precision, Recall, and F1 measure true positive retrieval.",
        "is_ai_generated": False
    },

    # 10. Deep Learning & PyTorch
    {
        "topic_name": "Deep Learning Prerequisites: Tensors & Autograd in PyTorch",
        "question": "In PyTorch, what attribute must be set to `True` on a tensor to enable automatic differentiation and gradient tracking during the backward pass?",
        "options": [
            "tensor.is_cuda = True",
            "tensor.requires_grad = True",
            "tensor.track_math = True",
            "tensor.autograd_enabled = True"
        ],
        "correct_index": 1,
        "explanation": "Setting `requires_grad=True` signals PyTorch's autograd engine to record operations performed on the tensor into a directed computational graph.",
        "is_ai_generated": False
    },
    {
        "topic_name": "Deep Learning Prerequisites: Tensors & Autograd in PyTorch",
        "question": "Why is `optimizer.zero_grad()` called before `loss.backward()` in a PyTorch training loop?",
        "options": [
            "To reset model weights to random initialization",
            "Because PyTorch accumulates gradients by default; without clearing, gradients from previous iterations add up",
            "To clear the GPU VRAM cache completely",
            "To convert tensors into NumPy ndarrays"
        ],
        "correct_index": 1,
        "explanation": "PyTorch accumulates gradients on `.grad` buffers to support multi-step batching. `zero_grad()` resets the buffers so each backward pass computes only current gradients.",
        "is_ai_generated": False
    }
]

def seed_quiz_bank(db: Session):
    """Populates the database with built-in quiz questions, avoiding duplicates."""
    for q in BUILTIN_QUESTIONS:
        existing = db.query(QuizQuestion).filter(
            QuizQuestion.question == q["question"]
        ).first()
        if not existing:
            question = QuizQuestion(
                topic_name=q["topic_name"],
                question=q["question"],
                options_json=json.dumps(q["options"]),
                correct_index=q["correct_index"],
                explanation=q["explanation"],
                is_ai_generated=q["is_ai_generated"]
            )
            db.add(question)
    db.commit()


def synthesize_questions_for_topic(topic_name: str) -> List[Dict]:
    """Creates five transparent template-based practice questions for custom topics."""
    clean = topic_name.strip()
    return [
        {
            "topic_name": clean,
            "question": f"What is the foundational architectural objective when working with {clean}?",
            "options": [
                f"Establishing clean separation of concerns and deterministic behavior in {clean}",
                f"Deleting all existing configuration files in {clean}",
                f"Maximizing CPU clock speed without testing edge cases",
                f"Replacing modular design with monolithic scripts"
            ],
            "correct_index": 0,
            "explanation": f"When mastering {clean}, building modular components with clear separation of concerns ensures maintainability and scalability.",
            "is_ai_generated": False
        },
        {
            "topic_name": clean,
            "question": f"Which best practice should be applied to avoid runtime exceptions and memory bottlenecks in {clean}?",
            "options": [
                "Ignoring error boundaries and exception handling",
                "Implementing structured validation, resource cleanup, and defensive type checks",
                "Disabling logging and monitoring metrics",
                "Allocating unbounded memory buffers"
            ],
            "correct_index": 1,
            "explanation": f"Robust systems in {clean} implement validation, defensive error handling, and prompt resource management to guarantee reliability.",
            "is_ai_generated": False
        },
        {
            "topic_name": clean,
            "question": f"When measuring performance and production readiness in {clean}, which metric is most diagnostic?",
            "options": [
                "Source code line count only",
                "Latency, throughput, and error rates under real-world input distribution",
                "Number of comments in the root file",
                "Compiler binary file name length"
            ],
            "correct_index": 1,
            "explanation": f"Latency, throughput, and system stability under real-world load provide the truest assessment of production health in {clean}.",
            "is_ai_generated": False
        },
        {
            "topic_name": clean,
            "question": f"What is the most reliable first step when debugging an unexpected issue in {clean}?",
            "options": [
                "Change several unrelated components at once",
                "Ignore the input and assume the issue is intermittent",
                "Compare the number of lines in the source files",
                "Reproduce the issue with a small input and inspect the error and relevant logs",
            ],
            "correct_index": 3,
            "explanation": "A small reproducible case and relevant error details make it possible to test a specific cause instead of guessing.",
            "is_ai_generated": False,
        },
        {
            "topic_name": clean,
            "question": f"How should you check that a solution for {clean} handles more than the simplest case?",
            "options": [
                "Test representative inputs, boundaries, and likely failure cases",
                "Test only the example that first passed",
                "Remove validation to reduce the number of branches",
                "Assume similar tools behave exactly the same",
            ],
            "correct_index": 0,
            "explanation": "Testing typical, boundary, and failure inputs helps reveal assumptions that a single happy-path example cannot catch.",
            "is_ai_generated": False,
        }
    ]


def get_questions_for_topic(db: Session, topic_name: str) -> List[QuizQuestion]:
    """Retrieves quiz questions for a topic, matching topic name, keywords, or synthesizing new ones."""
    topic_clean = topic_name.strip()

    # 1. Exact or partial match on topic_name
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.topic_name.ilike(f"%{topic_clean}%")
    ).all()

    # 2. Match on keywords if direct match not found
    if not questions and topic_clean:
        generic_terms = {
            "about", "advanced", "basics", "beginner", "concepts", "computing",
            "course", "fundamentals", "introduction", "intro", "intermediate",
            "learning", "mastery", "overview", "practice", "programming", "system",
            "systems", "theory", "topic",
        }
        keywords = [
            word for word in topic_clean.replace(":", " ").replace(",", " ").replace("&", " ").split()
            if len(word) > 3 and word.lower() not in generic_terms
        ]
        for kw in keywords:
            matched = db.query(QuizQuestion).filter(
                (QuizQuestion.topic_name.ilike(f"%{kw}%")) | (QuizQuestion.question.ilike(f"%{kw}%"))
            ).all()
            if matched:
                questions = matched
                break

    # 3. If still no questions, synthesize diagnostic questions, save to DB, and return
    if not questions and topic_clean:
        synthesized = synthesize_questions_for_topic(topic_clean)
        for sq in synthesized:
            new_q = QuizQuestion(
                topic_name=sq["topic_name"],
                question=sq["question"],
                options_json=json.dumps(sq["options"]),
                correct_index=sq["correct_index"],
                explanation=sq["explanation"],
                is_ai_generated=sq["is_ai_generated"]
            )
            db.add(new_q)
        db.commit()

        questions = db.query(QuizQuestion).filter(
            QuizQuestion.topic_name == topic_clean
        ).all()

    # 4. Ultimate fallback to ensure questions are never empty
    if not questions:
        questions = db.query(QuizQuestion).limit(4).all()

    return questions
